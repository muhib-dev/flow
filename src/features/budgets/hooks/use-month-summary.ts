import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getMonthSummary } from '@/features/transactions/api/transactions-repo';
import { transactionKeys } from '@/features/transactions/hooks/query-keys';
import { currentMonth } from '@/lib/format';

export function useMonthSummary(month = currentMonth()) {
  return useQuery({
    queryKey: transactionKeys.summary(month),
    queryFn: () => getMonthSummary(month),
    placeholderData: keepPreviousData,
  });
}
