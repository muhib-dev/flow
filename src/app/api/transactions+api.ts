import { withChaos } from '@/lib/mock-server/chaos';
import {
  getStore,
  isTransactionDto,
  listTransactions,
  upsertTransaction,
} from '@/lib/mock-server/store';

export const GET = withChaos(() => Response.json(listTransactions(getStore())));

export const POST = withChaos(async (request: Request) => {
  const body: unknown = await request.json();
  if (!isTransactionDto(body)) {
    return new Response('Invalid transaction', { status: 422 });
  }
  return Response.json(upsertTransaction(getStore(), body));
});
