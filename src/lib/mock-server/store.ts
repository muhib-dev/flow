import type { TransactionDto } from './types';

type Store = Map<string, TransactionDto>;

// Kept on globalThis so Metro fast refresh does not wipe the mock database.
const globalStore = globalThis as typeof globalThis & { __flowMockStore?: Store };

export function createStore(): Store {
  return new Map();
}

export function getStore(): Store {
  globalStore.__flowMockStore ??= createStore();
  return globalStore.__flowMockStore;
}

export function listTransactions(store: Store) {
  return [...store.values()].sort((a, b) => b.occurredAt - a.occurredAt);
}

/** Idempotent last-write-wins upsert keyed by the client-generated id. */
export function upsertTransaction(store: Store, dto: TransactionDto) {
  const existing = store.get(dto.id);
  if (!existing || existing.updatedAt <= dto.updatedAt) {
    store.set(dto.id, dto);
  }
  return store.get(dto.id)!;
}

export function deleteTransaction(store: Store, id: string, deletedAt: number) {
  const existing = store.get(id);
  if (!existing) return null;
  const tombstone = { ...existing, deletedAt, updatedAt: deletedAt };
  store.set(id, tombstone);
  return tombstone;
}

export function isTransactionDto(value: unknown): value is TransactionDto {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    Number.isInteger(v.amountCents) &&
    (v.amountCents as number) > 0 &&
    typeof v.categoryId === 'string' &&
    typeof v.note === 'string' &&
    typeof v.occurredAt === 'number' &&
    typeof v.updatedAt === 'number' &&
    (v.deletedAt === null || typeof v.deletedAt === 'number')
  );
}
