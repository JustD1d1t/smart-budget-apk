import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";

export type Friend = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: "pending" | "accepted";
  created_at: string;
  user_email: string; // dla wyświetlania
};

type FriendsStore = {
  friends: Friend[];
  fetchFriends: () => Promise<{ success: boolean; error?: string }>;
  sendInvite: (email: string) => Promise<{ success: boolean; error?: string }>;
  acceptInvite: (id: string) => Promise<{ success: boolean; error?: string }>;
  removeFriend: (id: string) => Promise<{ success: boolean; error?: string }>;
};

export const useFriendsStore = create<FriendsStore>((set, get) => ({
  friends: [],

  fetchFriends: async () => {
    try {
      const userResp = await supabase.auth.getUser();
      const user = userResp.data.user;
      if (!user) throw new Error("Brak zalogowanego użytkownika");

      const { data, error } = await supabase
        .from("friends")
        .select(
          `*,
        recipient:recipient_id ( email ),
        requester:requester_id ( email )`
        )
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (error) throw error;
      const enriched = data!.map((row: any) => ({
        id: row.id,
        requester_id: row.requester_id,
        recipient_id: row.recipient_id,
        status: row.status,
        created_at: row.created_at,
        user_email:
          row.requester_id === user.id
            ? row.recipient.email
            : row.requester.email,
      }));
      set({ friends: enriched });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  sendInvite: async (email) => {
    try {
      const { data: userToInvite, error: userErr } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();
      if (userErr || !userToInvite)
        throw new Error("Nie znaleziono użytkownika");

      const userResp = await supabase.auth.getUser();
      const user = userResp.data.user;
      if (!user) throw new Error("Brak zalogowanego użytkownika");

      const { error: insertErr } = await supabase.from("friends").insert({
        requester_id: user.id,
        recipient_id: userToInvite.id,
      });
      if (insertErr) throw insertErr;

      await get().fetchFriends();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  acceptInvite: async (id) => {
    try {
      const { error } = await supabase
        .from("friends")
        .update({ status: "accepted" })
        .eq("id", id);
      if (error) throw error;
      await get().fetchFriends();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  removeFriend: async (id) => {
    try {
      const { error } = await supabase.from("friends").delete().eq("id", id);
      if (error) throw error;
      await get().fetchFriends();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
}));
