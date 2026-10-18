import { useMutation } from '@tanstack/react-query';

import { toast } from '@/design-system/toast-store';

import { requestMagicLink } from '../api/auth-api';
import { useSessionStore } from '../store/session-store';

export function useSignIn() {
  const signIn = useSessionStore((s) => s.signIn);

  return useMutation({
    mutationFn: requestMagicLink,
    onSuccess: (session) => signIn(session),
    onError: () => toast.error('Could not send the magic link. Try again.'),
  });
}
