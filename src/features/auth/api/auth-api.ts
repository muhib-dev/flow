import { apiFetch } from '@/lib/api';

export const requestMagicLink = (email: string) =>
  apiFetch<{ email: string; token: string }>('/api/auth/magic-link', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
