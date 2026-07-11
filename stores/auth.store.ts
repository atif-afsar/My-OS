import { create } from "zustand";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthStore {
  user: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: UserProfile | null) => void;
  initialize: () => () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user, loading: false }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, loading: false });
  },
  initialize: () => {
    // 1. Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const profile: UserProfile = {
          id: u.id,
          email: u.email || "",
          name: u.user_metadata?.name || u.email?.split("@")[0],
          avatar: u.user_metadata?.avatar_url || "",
        };

        try {
          await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile),
          });
        } catch (e) {
          console.error("Failed to sync auth user", e);
        }

        set({ user: profile, loading: false, initialized: true });
      } else {
        set({ user: null, loading: false, initialized: true });
      }
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        const profile: UserProfile = {
          id: u.id,
          email: u.email || "",
          name: u.user_metadata?.name || u.email?.split("@")[0],
          avatar: u.user_metadata?.avatar_url || "",
        };

        try {
          await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile),
          });
        } catch (e) {
          console.error("Failed to sync auth user", e);
        }

        set({ user: profile, loading: false, initialized: true });
      } else {
        set({ user: null, loading: false, initialized: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },
}));
export type { UserProfile };
