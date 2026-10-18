import { and, asc, desc, eq, gte, isNull, lt, sql, sum } from 'drizzle-orm';

import { db } from '@/lib/db/client';
import { budgets, categories, outbox, transactions, type Transaction } from '@/lib/db/schema';
import { monthRange } from '@/lib/format';
import type { TransactionDto } from '@/lib/mock-server/types';

import type { LocalStore, OutboxItem, OutboxStore } from './sync-engine';

export type TransactionInput = {
  id: string;
  amountCents: number;
  categoryId: string;
  note: string;
  occurredAt: number;
};

export type TransactionListItem = Pick<
  Transaction,
  'id' | 'amountCents' | 'note' | 'occurredAt' | 'syncStatus' | 'categoryId'
> & { categoryName: string; categoryColor: string; categoryIcon: string };

const listColumns = {
  id: transactions.id,
  amountCents: transactions.amountCents,
  note: transactions.note,
  occurredAt: transactions.occurredAt,
  syncStatus: transactions.syncStatus,
  categoryId: transactions.categoryId,
  categoryName: categories.name,
  categoryColor: categories.color,
  categoryIcon: categories.icon,
};

const toDto = (row: Transaction): TransactionDto => ({
  id: row.id,
  amountCents: row.amountCents,
  categoryId: row.categoryId,
  note: row.note,
  occurredAt: row.occurredAt,
  updatedAt: row.updatedAt,
  deletedAt: row.deletedAt,
});

export function listTransactions(filter?: { categoryId?: string; limit?: number }) {
  const query = db
    .select(listColumns)
    .from(transactions)
    .innerJoin(categories, eq(categories.id, transactions.categoryId))
    .where(
      and(
        isNull(transactions.deletedAt),
        filter?.categoryId ? eq(transactions.categoryId, filter.categoryId) : undefined,
      ),
    )
    .orderBy(desc(transactions.occurredAt));
  return filter?.limit ? query.limit(filter.limit) : query;
}

export async function getTransaction(id: string): Promise<TransactionListItem | null> {
  const [row] = await db
    .select(listColumns)
    .from(transactions)
    .innerJoin(categories, eq(categories.id, transactions.categoryId))
    .where(and(eq(transactions.id, id), isNull(transactions.deletedAt)));
  return row ?? null;
}

export function listCategories() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export type BudgetSummary = {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  limitCents: number;
  spentCents: number;
};

export async function getMonthSummary(month: string): Promise<BudgetSummary[]> {
  const { start, end } = monthRange(month);
  const spent = db
    .select({
      categoryId: transactions.categoryId,
      spentCents: sum(transactions.amountCents).mapWith(Number).as('spent_cents'),
    })
    .from(transactions)
    .where(
      and(
        isNull(transactions.deletedAt),
        gte(transactions.occurredAt, start),
        lt(transactions.occurredAt, end),
      ),
    )
    .groupBy(transactions.categoryId)
    .as('spent');

  return db
    .select({
      categoryId: categories.id,
      name: categories.name,
      color: categories.color,
      icon: categories.icon,
      limitCents: sql<number>`coalesce(${budgets.limitCents}, 0)`,
      spentCents: sql<number>`coalesce(${spent.spentCents}, 0)`,
    })
    .from(categories)
    .leftJoin(budgets, and(eq(budgets.categoryId, categories.id), eq(budgets.month, month)))
    .leftJoin(spent, eq(spent.categoryId, categories.id))
    .orderBy(asc(categories.sortOrder));
}

/** Writes the row and its outbox entry atomically so a crash can't lose the sync. */
export async function saveTransaction(input: TransactionInput) {
  const now = Date.now();
  const row: Transaction = { ...input, updatedAt: now, deletedAt: null, syncStatus: 'pending' };
  await db.transaction(async (tx) => {
    await tx
      .insert(transactions)
      .values(row)
      .onConflictDoUpdate({ target: transactions.id, set: row });
    await tx.insert(outbox).values({
      entityId: row.id,
      op: 'upsert',
      payload: JSON.stringify(toDto(row)),
      createdAt: now,
    });
  });
  return row;
}

export async function deleteTransaction(id: string) {
  const now = Date.now();
  await db.transaction(async (tx) => {
    const [row] = await tx
      .update(transactions)
      .set({ deletedAt: now, updatedAt: now, syncStatus: 'pending' })
      .where(eq(transactions.id, id))
      .returning();
    if (!row) throw new Error(`Transaction ${id} not found`);
    await tx.insert(outbox).values({
      entityId: id,
      op: 'delete',
      payload: JSON.stringify(toDto(row)),
      createdAt: now,
    });
  });
}

export async function countPendingWrites() {
  const [{ value }] = await db.select({ value: sql<number>`count(*)` }).from(outbox);
  return value;
}

export const outboxStore: OutboxStore = {
  async peek(limit) {
    const rows = await db.select().from(outbox).orderBy(asc(outbox.id)).limit(limit);
    return rows.map((r): OutboxItem => ({
      id: r.id,
      entityId: r.entityId,
      op: r.op,
      payload: JSON.parse(r.payload) as TransactionDto,
      attempts: r.attempts,
    }));
  },
  async remove(id) {
    await db.delete(outbox).where(eq(outbox.id, id));
  },
  async recordFailure(id, error) {
    await db
      .update(outbox)
      .set({ attempts: sql`${outbox.attempts} + 1`, lastError: error })
      .where(eq(outbox.id, id));
  },
};

export const localStore: LocalStore = {
  async markSynced(entityId, updatedAt) {
    await db
      .update(transactions)
      .set({ syncStatus: 'synced' })
      .where(and(eq(transactions.id, entityId), eq(transactions.updatedAt, updatedAt)));
  },
  async markRejected(entityId) {
    await db
      .update(transactions)
      .set({ syncStatus: 'failed' })
      .where(eq(transactions.id, entityId));
  },
  async applyRemote(rows) {
    if (rows.length === 0) return;
    await db.transaction(async (tx) => {
      for (const dto of rows) {
        const [local] = await tx
          .select({ updatedAt: transactions.updatedAt, syncStatus: transactions.syncStatus })
          .from(transactions)
          .where(eq(transactions.id, dto.id));
        // Never overwrite local edits that have not reached the server yet.
        if (local && (local.syncStatus === 'pending' || local.updatedAt >= dto.updatedAt)) continue;
        const row = { ...dto, syncStatus: 'synced' as const };
        await tx
          .insert(transactions)
          .values(row)
          .onConflictDoUpdate({ target: transactions.id, set: row });
      }
    });
  },
};
