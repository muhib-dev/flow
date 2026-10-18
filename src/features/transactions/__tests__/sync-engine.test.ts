import { ApiError, NetworkError } from '@/lib/api';
import {
  createStore,
  deleteTransaction,
  listTransactions,
  upsertTransaction,
} from '@/lib/mock-server/store';
import type { TransactionDto } from '@/lib/mock-server/types';

import {
  createSyncEngine,
  type LocalStore,
  type OutboxItem,
  type OutboxStore,
  type RemoteApi,
} from '../api/sync-engine';

const dto = (id: string, updatedAt = 1): TransactionDto => ({
  id,
  amountCents: 1200,
  categoryId: 'food',
  note: '',
  occurredAt: updatedAt,
  updatedAt,
  deletedAt: null,
});

function fakeOutbox(items: Omit<OutboxItem, 'attempts'>[]) {
  const queue: OutboxItem[] = items.map((i) => ({ ...i, attempts: 0 }));
  const store: OutboxStore = {
    peek: async (limit) => queue.slice(0, limit),
    remove: async (id) => {
      const index = queue.findIndex((i) => i.id === id);
      if (index >= 0) queue.splice(index, 1);
    },
    recordFailure: async (id) => {
      const item = queue.find((i) => i.id === id);
      if (item) item.attempts += 1;
    },
  };
  return { queue, store };
}

function fakeLocal() {
  const synced: string[] = [];
  const rejected: string[] = [];
  const store: LocalStore = {
    markSynced: async (id) => void synced.push(id),
    markRejected: async (id) => void rejected.push(id),
    applyRemote: async () => {},
  };
  return { synced, rejected, store };
}

/** Remote backed by the real mock-server store so idempotency is exercised end to end. */
function fakeRemote(behaviour: (call: number) => Error | null = () => null) {
  const server = createStore();
  let calls = 0;
  const remote: RemoteApi = {
    upsert: async (body) => {
      const error = behaviour(calls++);
      if (error) throw error;
      return upsertTransaction(server, body);
    },
    remove: async (id) => {
      const error = behaviour(calls++);
      if (error) throw error;
      return deleteTransaction(server, id, Date.now());
    },
    list: async () => listTransactions(server),
  };
  return { server, remote, calls: () => calls };
}

describe('sync engine offline queue', () => {
  it('pushes queued writes in order and clears the outbox', async () => {
    const outbox = fakeOutbox([
      { id: 1, entityId: 'a', op: 'upsert', payload: dto('a') },
      { id: 2, entityId: 'b', op: 'upsert', payload: dto('b') },
    ]);
    const local = fakeLocal();
    const { server, remote } = fakeRemote();

    const result = await createSyncEngine({
      outbox: outbox.store,
      local: local.store,
      remote,
    }).flush();

    expect(result).toEqual({ pushed: 2, rejected: [], stalled: false });
    expect(outbox.queue).toHaveLength(0);
    expect(local.synced).toEqual(['a', 'b']);
    expect(server.size).toBe(2);
  });

  it('keeps everything queued while offline and sends it once back online', async () => {
    const outbox = fakeOutbox([{ id: 1, entityId: 'a', op: 'upsert', payload: dto('a') }]);
    const local = fakeLocal();
    let online = false;
    const { server, remote } = fakeRemote(() => (online ? null : new NetworkError('offline')));
    const engine = createSyncEngine({ outbox: outbox.store, local: local.store, remote });

    const offline = await engine.flush();
    expect(offline.stalled).toBe(true);
    expect(outbox.queue).toHaveLength(1);
    // Being offline is not a server failure, so the attempt counter stays put.
    expect(outbox.queue[0].attempts).toBe(0);

    online = true;
    await engine.flush();
    expect(outbox.queue).toHaveLength(0);
    expect(server.size).toBe(1);
  });

  it('stops at a transient server error to preserve order and records the attempt', async () => {
    const outbox = fakeOutbox([
      { id: 1, entityId: 'a', op: 'upsert', payload: dto('a') },
      { id: 2, entityId: 'b', op: 'upsert', payload: dto('b') },
    ]);
    const local = fakeLocal();
    const { remote } = fakeRemote((call) => (call === 0 ? new ApiError(503, 'down') : null));

    const result = await createSyncEngine({
      outbox: outbox.store,
      local: local.store,
      remote,
    }).flush();

    expect(result.stalled).toBe(true);
    expect(result.pushed).toBe(0);
    expect(outbox.queue.map((i) => i.id)).toEqual([1, 2]);
    expect(outbox.queue[0].attempts).toBe(1);
  });

  it('drops permanently rejected writes and continues with the rest', async () => {
    const outbox = fakeOutbox([
      { id: 1, entityId: 'bad', op: 'upsert', payload: dto('bad') },
      { id: 2, entityId: 'good', op: 'upsert', payload: dto('good') },
    ]);
    const local = fakeLocal();
    const { remote } = fakeRemote((call) => (call === 0 ? new ApiError(422, 'invalid') : null));

    const result = await createSyncEngine({
      outbox: outbox.store,
      local: local.store,
      remote,
    }).flush();

    expect(result.rejected.map((i) => i.entityId)).toEqual(['bad']);
    expect(local.rejected).toEqual(['bad']);
    expect(local.synced).toEqual(['good']);
    expect(outbox.queue).toHaveLength(0);
  });

  it('shares one run between concurrent flushes so nothing is sent twice', async () => {
    const outbox = fakeOutbox([{ id: 1, entityId: 'a', op: 'upsert', payload: dto('a') }]);
    const local = fakeLocal();
    const { remote, calls } = fakeRemote();
    const engine = createSyncEngine({ outbox: outbox.store, local: local.store, remote });

    await Promise.all([engine.flush(), engine.flush(), engine.flush()]);

    expect(calls()).toBe(1);
  });

  it('never duplicates when a write is retried after the server already stored it', async () => {
    const server = createStore();
    upsertTransaction(server, dto('a', 5));
    upsertTransaction(server, dto('a', 5));
    expect(listTransactions(server)).toHaveLength(1);
  });

  it('keeps the newer server copy when an older retry arrives late', () => {
    const server = createStore();
    upsertTransaction(server, { ...dto('a', 10), note: 'newer' });
    upsertTransaction(server, { ...dto('a', 5), note: 'older' });
    expect(server.get('a')?.note).toBe('newer');
  });
});
