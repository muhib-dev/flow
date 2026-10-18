import type { TransactionFilter } from '../api/transactions-repo';

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (filter: TransactionFilter = {}) => [...transactionKeys.all, 'list', filter] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
  summary: (month: string) => [...transactionKeys.all, 'summary', month] as const,
  daily: (month: string) => [...transactionKeys.all, 'daily', month] as const,
  pending: () => [...transactionKeys.all, 'pending'] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
};
