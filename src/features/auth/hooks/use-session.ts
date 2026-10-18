import { useSessionStore } from '../store/session-store';

export function useSession() {
  const status = useSessionStore((s) => s.status);
  const email = useSessionStore((s) => s.email);
  const signOut = useSessionStore((s) => s.signOut);
  return { status, email, isSignedIn: status === 'signedIn', signOut };
}
