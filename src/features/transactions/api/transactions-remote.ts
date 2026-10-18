import { apiFetch } from '@/lib/api';
import type { TransactionDto } from '@/lib/mock-server/types';

import type { RemoteApi } from './sync-engine';

export const transactionsRemote: RemoteApi = {
  upsert: (dto) => apiFetch('/api/transactions', { method: 'POST', body: JSON.stringify(dto) }),
  remove: (id) => apiFetch(`/api/transactions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  list: () => apiFetch<TransactionDto[]>('/api/transactions'),
};
