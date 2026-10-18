import { useQuery } from '@tanstack/react-query';

import { getTransaction, listCategories, listTransactions } from '../api/transactions-repo';
import { categoryKeys, transactionKeys } from './query-keys';

export function useTransactions(filter: { categoryId?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: transactionKeys.list(filter),
    queryFn: () => listTransactions(filter),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => getTransaction(id),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => listCategories(),
    staleTime: Infinity,
  });
}
