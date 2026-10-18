import { toast } from '@/design-system/toast-store';
import { queryClient } from '@/lib/query-client';

import { transactionKeys } from '../hooks/query-keys';
import { createSyncEngine } from './sync-engine';
import { transactionsRemote } from './transactions-remote';
import { localStore, outboxStore } from './transactions-repo';

const engine = createSyncEngine({
  outbox: outboxStore,
  local: localStore,
  remote: transactionsRemote,
});

/** Push queued writes, then pull server changes. Safe to call often. */
export async function syncNow({ pull = true } = {}) {
  const result = await engine.flush();
  if (result.rejected.length > 0) {
    toast.error(`${result.rejected.length} change(s) were rejected by the server`);
  }
  if (pull && !result.stalled) {
    try {
      await engine.pull();
    } catch {
      // Pull is best effort; the next reconnect or refresh retries it.
    }
  }
  await queryClient.invalidateQueries({ queryKey: transactionKeys.all });
  return result;
}
