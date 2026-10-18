import { withChaos } from '@/lib/mock-server/chaos';
import { deleteTransaction, getStore } from '@/lib/mock-server/store';

export const DELETE = withChaos((_request: Request, { id }: Record<string, string>) => {
  const tombstone = deleteTransaction(getStore(), id, Date.now());
  // Deleting something the server never saw is fine: the client only needs the tombstone gone.
  return Response.json(tombstone ?? { id });
});
