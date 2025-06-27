// stores/pantriesStore.ts
import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";

export interface Pantry {
  id: string;
  name: string;
  owner_id: string;
  isOwner?: boolean;
}
export interface Viewer {
  id: string;
  email: string;
  role: "owner" | "member";
}

export interface PantryItem {
  id: string;
  pantry_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiry_date?: string | null;
}

interface PantriesStore {
  pantries: Pantry[];
  pantryItems: PantryItem[];
  selectedPantry: Pantry | null;
  isOwner: boolean;
  loading: boolean;
  members: Viewer[];
  fetchPantries: () => Promise<{ success: boolean; error?: string }>;
  fetchPantryDetails: (
    pantryId: string
  ) => Promise<{ success: boolean; error?: string }>;
  fetchPantryItems: (
    pantryId: string
  ) => Promise<{ success: boolean; error?: string }>;
  addPantry: (name: string) => Promise<{ success: boolean; error?: string }>;
  removePantry: (id: string) => Promise<{ success: boolean; error?: string }>;
  renamePantry: (
    id: string,
    newName: string
  ) => Promise<{ success: boolean; error?: string }>;
  addPantryItem: (
    item: PantryItem
  ) => Promise<{ success: boolean; error?: string }>;
  updatePantryItem: (
    item: PantryItem
  ) => Promise<{ success: boolean; error?: string }>;
  deletePantryItem: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateItemQuantity: (
    id: string,
    quantity: number
  ) => Promise<{ success: boolean; error?: string }>;
  addMember: (
    pantryId: string,
    friendEmail: string
  ) => Promise<{ success: boolean; error?: string }>;
  removeMember: (
    pantryId: string,
    friendEmail: string
  ) => Promise<{ success: boolean; error?: string }>;
  fetchMembers: (
    pantryId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export const usePantriesStore = create<PantriesStore>((set, get) => ({
  pantries: [],
  pantryItems: [],
  selectedPantry: null,
  isOwner: false,
  loading: false,
  members: [],
  fetchMembers: async (pantryId: string) => {
    try {
      const { data, error } = await supabase
        .from("pantry_members")
        .select("id, email, role")
        .eq("pantry_id", pantryId);

      if (error) throw error;

      set({
        members: data || [],
      });

      return { success: true };
    } catch (e: any) {
      const message = e.message || "Nie udało się pobrać współtwórców";
      return { success: false, error: message };
    }
  },
  addMember: async (pantryId, friendEmail) => {
    try {
      // 1. find user id
      const { data: userData, error: userErr } = await supabase
        .from("users")
        .select("id")
        .eq("email", friendEmail)
        .limit(1)
        .single();
      if (userErr || !userData)
        throw new Error("Nie znaleziono użytkownika o podanym e-mailu.");
      const userId = userData.id;

      // 2. check existing membership
      const { data: existing, error: checkErr } = await supabase
        .from("pantry_members")
        .select("id")
        .eq("pantry_id", pantryId)
        .eq("user_id", userId);
      if (checkErr) throw new Error("Nie udało się sprawdzić współtwórców.");
      if (existing && existing.length > 0)
        throw new Error("Użytkownik jest już współtwórcą tej spiżarni.");

      // 3. insert
      const { error: insertErr } = await supabase
        .from("pantry_members")
        .insert({
          pantry_id: pantryId,
          user_id: userId,
          email: friendEmail,
          role: "member",
        });
      if (insertErr) throw insertErr;

      // 4. refresh members list
      await get().fetchPantryDetails(pantryId);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
  removeMember: async (pantryId, friendEmail) => {
    try {
      // 1. lookup user
      const { data: userData, error: userErr } = await supabase
        .from("users")
        .select("id")
        .eq("email", friendEmail)
        .limit(1)
        .single();
      if (userErr || !userData)
        throw new Error("Nie znaleziono użytkownika o podanym e-mailu.");
      const userId = userData.id;

      // 2. check membership
      const { data: existing, error: checkErr } = await supabase
        .from("pantry_members")
        .select("id")
        .eq("pantry_id", pantryId)
        .eq("user_id", userId);
      if (checkErr) throw new Error("Nie udało się sprawdzić współtwórców.");
      if (!existing || existing.length === 0)
        throw new Error("Użytkownik nie jest współtwórcą tej spiżarni.");

      // 3. delete
      const { error: deleteErr } = await supabase
        .from("pantry_members")
        .delete()
        .eq("pantry_id", pantryId)
        .eq("user_id", userId);
      if (deleteErr) throw deleteErr;

      // 4. refresh
      await get().fetchPantryDetails(pantryId);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  fetchPantries: async () => {
    try {
      set({ loading: true });
      const { data: userData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !userData.user)
        throw new Error(authError?.message || "No user");
      const userId = userData.user.id;

      const { data: viewerLinks, error: linksError } = await supabase
        .from("pantry_members")
        .select("pantry_id")
        .eq("user_id", userId);
      if (linksError) throw linksError;
      const sharedIds = viewerLinks?.map((v) => v.pantry_id) || [];

      const { data: ownedPantries, error: ownError } = await supabase
        .from("pantries")
        .select("*")
        .eq("owner_id", userId);
      if (ownError) throw ownError;

      const { data: sharedPantries, error: sharedError } = sharedIds.length
        ? await supabase
            .from("pantries")
            .select("*")
            .in("id", sharedIds)
            .neq("owner_id", userId)
        : { data: [] };
      if (sharedError) throw sharedError;

      const combined = [...(ownedPantries || []), ...(sharedPantries || [])];
      const withOwnership = combined.map((p) => ({
        ...p,
        isOwner: p.owner_id === userId,
      }));

      set({ pantries: withOwnership, loading: false });
      return { success: true };
    } catch (e: any) {
      set({ loading: false });
      return { success: false, error: e.message };
    }
  },

  fetchPantryDetails: async (id) => {
    try {
      const { data: userData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !userData.user)
        throw new Error(authError?.message || "No user");
      const userId = userData.user.id;

      const { data, error } = await supabase
        .from("pantries")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;

      set({ selectedPantry: data, isOwner: data.owner_id === userId });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  fetchPantryItems: async (pantryId) => {
    try {
      const { data, error } = await supabase
        .from("pantry_items")
        .select("*")
        .eq("pantry_id", pantryId);
      if (error) throw error;
      set({ pantryItems: data || [] });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  addPantry: async (name) => {
    try {
      const { data: userData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !userData.user)
        throw new Error(authError?.message || "No user");
      const userId = userData.user.id;

      const { data: pantry, error } = await supabase
        .from("pantries")
        .insert({ name: name.trim(), owner_id: userId })
        .select()
        .single();
      if (error || !pantry) throw error || new Error("Error creating pantry");

      await get().fetchPantries();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  removePantry: async (id) => {
    try {
      const { error } = await supabase.from("pantries").delete().eq("id", id);
      if (error) throw error;
      set((state) => ({ pantries: state.pantries.filter((p) => p.id !== id) }));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  renamePantry: async (id, newName) => {
    try {
      const { error } = await supabase
        .from("pantries")
        .update({ name: newName })
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  addPantryItem: async (item) => {
    try {
      const { error } = await supabase.from("pantry_items").insert(item);
      if (error) throw error;
      set((state) => ({ pantryItems: [...state.pantryItems, item] }));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  updatePantryItem: async (item) => {
    try {
      const { error } = await supabase
        .from("pantry_items")
        .update({
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          expiry_date: item.expiry_date,
        })
        .eq("id", item.id);
      if (error) throw error;
      set((state) => ({
        pantryItems: state.pantryItems.map((i) =>
          i.id === item.id ? item : i
        ),
      }));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  deletePantryItem: async (id) => {
    try {
      const { error } = await supabase
        .from("pantry_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
      set((state) => ({
        pantryItems: state.pantryItems.filter((i) => i.id !== id),
      }));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  updateItemQuantity: async (id, quantity) => {
    try {
      const { error } = await supabase
        .from("pantry_items")
        .update({ quantity })
        .eq("id", id);
      if (error) throw error;
      set((state) => ({
        pantryItems: state.pantryItems.map((i) =>
          i.id === id ? { ...i, quantity } : i
        ),
      }));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
}));
