import { withChaos } from '@/lib/mock-server/chaos';

/** Mock magic link: responds as if the user already tapped the emailed link. */
export const POST = withChaos(async (request: Request) => {
  const { email } = (await request.json()) as { email?: unknown };
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return new Response('Invalid email', { status: 422 });
  }
  return Response.json({ email, token: `mock-${crypto.randomUUID()}` });
});
