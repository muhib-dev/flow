import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { listMonthAmounts } from '@/features/transactions/api/transactions-repo';
import { transactionKeys } from '@/features/transactions/hooks/query-keys';

import { dailyTotals } from '../api/daily-spend';

export function useDailySpend(month: string) {
  return useQuery({
    queryKey: transactionKeys.daily(month),
    queryFn: async () => dailyTotals(await listMonthAmounts(month), month),
    placeholderData: keepPreviousData,
  });
}
