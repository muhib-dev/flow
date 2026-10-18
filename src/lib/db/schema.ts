import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export type SyncStatus = 'pending' | 'synced' | 'failed';

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const budgets = sqliteTable(
  'budgets',
  {
    id: text('id').primaryKey(),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id),
    // Calendar month as YYYY-MM.
    month: text('month').notNull(),
    limitCents: integer('limit_cents').notNull(),
  },
  (t) => [index('budgets_month_idx').on(t.month)],
);

export const transactions = sqliteTable(
  'transactions',
  {
    id: text('id').primaryKey(),
    amountCents: integer('amount_cents').notNull(),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id),
    note: text('note').notNull().default(''),
    occurredAt: integer('occurred_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
    syncStatus: text('sync_status').$type<SyncStatus>().notNull().default('pending'),
  },
  (t) => [
    index('transactions_occurred_idx').on(t.occurredAt),
    index('transactions_category_idx').on(t.categoryId),
  ],
);

// Pending writes waiting to reach the server. Flushed FIFO by the sync engine.
export const outbox = sqliteTable('outbox', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entityId: text('entity_id').notNull(),
  op: text('op').$type<'upsert' | 'delete'>().notNull(),
  payload: text('payload').notNull(),
  attempts: integer('attempts').notNull().default(0),
  lastError: text('last_error'),
  createdAt: integer('created_at').notNull(),
});

export type Category = typeof categories.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type OutboxRow = typeof outbox.$inferSelect;
