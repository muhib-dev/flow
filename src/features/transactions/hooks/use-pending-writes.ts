import { useQuery } from '@tanstack/react-query';

import { countPendingWrites } from '../api/transactions-repo';
import { transactionKeys } from './query-keys';

export function usePendingWrites() {
  return useQuery({ queryKey: transactionKeys.pending(), queryFn: countPendingWrites });
}
