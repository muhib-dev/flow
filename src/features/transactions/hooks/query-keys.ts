export const transactionKeys = {
  all: ['transactions'] as const,
  list: (filter: { categoryId?: string; limit?: number } = {}) =>
    [...transactionKeys.all, 'list', filter] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
  summary: (month: string) => [...transactionKeys.all, 'summary', month] as const,
  pending: () => [...transactionKeys.all, 'pending'] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
};
