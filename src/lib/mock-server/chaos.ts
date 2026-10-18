const FAILURE_RATE = Number(process.env.EXPO_PUBLIC_MOCK_FAILURE_RATE ?? 0.1);
const MIN_LATENCY_MS = 300;
const MAX_LATENCY_MS = 800;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Wraps a mock API handler with random latency and a random 503 failure rate. */
export function withChaos<Args extends unknown[]>(
  handler: (...args: Args) => Response | Promise<Response>,
) {
  return async (...args: Args) => {
    await sleep(MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS));
    if (Math.random() < FAILURE_RATE) {
      return new Response('Mock server failure', { status: 503 });
    }
    return handler(...args);
  };
}
