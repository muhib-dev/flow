import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getTransaction,
  listCategories,
  listTransactions,
  type TransactionFilter,
} from '../api/transactions-repo';
import { categoryKeys, transactionKeys } from './query-keys';

export function useTransactions(filter: TransactionFilter = {}) {
  return useQuery({
    queryKey: transactionKeys.list(filter),
    queryFn: () => listTransactions(filter),
    // Switching month or category keeps the old rows up until the new ones land.
    placeholderData: keepPreviousData,
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
