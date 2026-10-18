import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { toast } from '@/design-system/toast-store';
import type { Category } from '@/lib/db/schema';

import { syncNow } from '../api/sync';
import {
  deleteTransaction,
  saveTransaction,
  type TransactionInput,
  type TransactionListItem,
} from '../api/transactions-repo';
import { categoryKeys, transactionKeys } from './query-keys';

type ListSnapshot = [readonly unknown[], TransactionListItem[] | undefined][];

/** Applies `update` to every cached transaction list and returns a snapshot for rollback. */
async function patchLists(
  queryClient: QueryClient,
  update: (items: TransactionListItem[]) => TransactionListItem[],
): Promise<ListSnapshot> {
  const listKey = [...transactionKeys.all, 'list'];
  await queryClient.cancelQueries({ queryKey: listKey });
  const snapshot = queryClient.getQueriesData<TransactionListItem[]>({ queryKey: listKey });
  queryClient.setQueriesData<TransactionListItem[]>({ queryKey: listKey }, (items) =>
    items ? update(items) : items,
  );
  return snapshot;
}

function rollback(queryClient: QueryClient, snapshot: ListSnapshot | undefined) {
  snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
}

export function useSaveTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveTransaction,
    onMutate: async (input: TransactionInput) => {
      const category = queryClient
        .getQueryData<Category[]>(categoryKeys.all)
        ?.find((c) => c.id === input.categoryId);
      const optimistic: TransactionListItem = {
        ...input,
        syncStatus: 'pending',
        categoryName: category?.name ?? '',
        categoryColor: category?.color ?? '',
        categoryIcon: category?.icon ?? '',
      };
      const snapshot = await patchLists(queryClient, (items) =>
        [optimistic, ...items.filter((t) => t.id !== input.id)].sort(
          (a, b) => b.occurredAt - a.occurredAt,
        ),
      );
      queryClient.setQueryData(transactionKeys.detail(input.id), optimistic);
      return { snapshot };
    },
    onError: (_error, input, context) => {
      rollback(queryClient, context?.snapshot);
      queryClient.removeQueries({ queryKey: transactionKeys.detail(input.id) });
      toast.error('Could not save the expense');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: transactionKeys.all }),
    onSuccess: () => void syncNow({ pull: false }),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (id: string) => {
      const snapshot = await patchLists(queryClient, (items) => items.filter((t) => t.id !== id));
      return { snapshot };
    },
    onError: (_error, _id, context) => {
      rollback(queryClient, context?.snapshot);
      toast.error('Could not delete the expense');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: transactionKeys.all }),
    onSuccess: () => void syncNow({ pull: false }),
  });
}
