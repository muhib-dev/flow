import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { storage } from '@/lib/storage';

const TOKEN_KEY = 'flow.session.token';

type SessionState = {
  status: 'loading' | 'signedOut' | 'signedIn';
  email: string | null;
  hydrate: () => Promise<void>;
  signIn: (session: { email: string; token: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useSessionStore = create<SessionState>((set) => ({
  status: 'loading',
  email: null,
  hydrate: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    set(
      token
        ? { status: 'signedIn', email: storage.getString('session.email') }
        : { status: 'signedOut', email: null },
    );
  },
  signIn: async ({ email, token }) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    storage.setString('session.email', email);
    set({ status: 'signedIn', email });
  },
  signOut: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    storage.remove('session.email');
    set({ status: 'signedOut', email: null });
  },
}));
