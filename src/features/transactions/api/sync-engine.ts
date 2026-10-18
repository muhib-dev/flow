import { ApiError, NetworkError } from '@/lib/api';
import type { TransactionDto } from '@/lib/mock-server/types';

export type OutboxItem = {
  id: number;
  entityId: string;
  op: 'upsert' | 'delete';
  payload: TransactionDto;
  attempts: number;
};

export interface OutboxStore {
  peek(limit: number): Promise<OutboxItem[]>;
  remove(id: number): Promise<void>;
  recordFailure(id: number, error: string): Promise<void>;
}

export interface LocalStore {
  /** Marks a row synced unless it was edited again after this payload was queued. */
  markSynced(entityId: string, updatedAt: number): Promise<void>;
  markRejected(entityId: string): Promise<void>;
  applyRemote(rows: TransactionDto[]): Promise<void>;
}

export interface RemoteApi {
  upsert(dto: TransactionDto): Promise<unknown>;
  remove(id: string): Promise<unknown>;
  list(): Promise<TransactionDto[]>;
}

export type FlushResult = {
  pushed: number;
  rejected: OutboxItem[];
  /** True when the queue still has items (offline or server error). */
  stalled: boolean;
};

const BATCH_SIZE = 50;

export function createSyncEngine(deps: {
  outbox: OutboxStore;
  local: LocalStore;
  remote: RemoteApi;
}) {
  const { outbox, local, remote } = deps;
  let inFlight: Promise<FlushResult> | null = null;

  async function drain(): Promise<FlushResult> {
    const result: FlushResult = { pushed: 0, rejected: [], stalled: false };

    for (;;) {
      const items = await outbox.peek(BATCH_SIZE);
      if (items.length === 0) return result;

      for (const item of items) {
        try {
          if (item.op === 'delete') await remote.remove(item.entityId);
          else await remote.upsert(item.payload);
        } catch (error) {
          if (error instanceof ApiError && error.isPermanent) {
            await outbox.remove(item.id);
            await local.markRejected(item.entityId);
            result.rejected.push(item);
            continue;
          }
          // Offline or transient server error: stop to keep FIFO order, retry on next flush.
          if (!(error instanceof NetworkError)) {
            await outbox.recordFailure(item.id, String(error));
          }
          result.stalled = true;
          return result;
        }
        await outbox.remove(item.id);
        await local.markSynced(item.entityId, item.payload.updatedAt);
        result.pushed += 1;
      }
    }
  }

  return {
    /** Pushes queued writes. Concurrent calls share one run so nothing is sent twice. */
    flush(): Promise<FlushResult> {
      inFlight ??= drain().finally(() => {
        inFlight = null;
      });
      return inFlight;
    },

    async pull() {
      await local.applyRemote(await remote.list());
    },
  };
}

export type SyncEngine = ReturnType<typeof createSyncEngine>;
