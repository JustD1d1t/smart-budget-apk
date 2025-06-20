import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";

type UserState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null, session: Session | null) => void;
  logout: () => Promise<void>; // 👈 DODAJ TO
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user, session) => set({ user, session }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));

supabase.auth.getSession().then(({ data }) => {
  const session = data.session;
  if (session) {
    useUserStore.setState({ user: session.user, session, loading: false });
  } else {
    useUserStore.setState({ user: null, session: null, loading: false });
  }
});
