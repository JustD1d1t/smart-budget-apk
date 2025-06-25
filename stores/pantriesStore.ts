import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";

export interface Pantry {
  id: string;
  name: string;
  owner_id: string;
  isOwner?: boolean;
}

export interface PantryItem {
  id: string;
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
  fetchPantries: () => Promise<void>;
  fetchPantryDetails: (pantryId: string) => Promise<void>;
  fetchPantryItems: (pantryId: string) => Promise<void>;
  addPantry: (name: string) => Promise<{ success: boolean; error?: string }>;
  removePantry: (id: string) => Promise<void>;
  renamePantry: (id: string, newName: string) => Promise<void>;
  addPantryItem: (item: PantryItem) => void;
  updatePantryItem: (item: PantryItem) => void;
  deletePantryItem: (id: string) => Promise<void>;
  updateItemQuantity: (id: string, quantity: number) => Promise<void>;
}

export const usePantriesStore = create<PantriesStore>((set, get) => ({
  pantries: [],
  pantryItems: [],
  selectedPantry: null,
  isOwner: false,
  loading: false,

  fetchPantries: async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    set({ loading: true });

    const { data: viewerLinks } = await supabase
      .from("pantry_members")
      .select("pantry_id")
      .eq("user_id", userId);

    const sharedIds = viewerLinks?.map((v) => v.pantry_id) || [];

    const { data: ownedPantries } = await supabase
      .from("pantries")
      .select("*")
      .eq("owner_id", userId);

    const { data: sharedPantries } = sharedIds.length
      ? await supabase
          .from("pantries")
          .select("*")
          .in("id", sharedIds)
          .neq("owner_id", userId)
      : { data: [] };

    const combined = [...(ownedPantries || []), ...(sharedPantries || [])];
    const withOwnership = combined.map((p) => ({
      ...p,
      isOwner: p.owner_id === userId,
    }));

    set({ pantries: withOwnership, loading: false });
  },

  fetchPantryDetails: async (id) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const { data } = await supabase
      .from("pantries")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      set({
        selectedPantry: data,
        isOwner: data.owner_id === userId,
      });
    }
  },

  fetchPantryItems: async (id) => {
    const { data } = await supabase
      .from("pantry_items")
      .select("*")
      .eq("pantry_id", id);

    if (data) {
      set({ pantryItems: data });
    }
  },

  addPantry: async (name: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return { success: false, error: "Brak użytkownika" };

    const { data: pantry, error: pantryError } = await supabase
      .from("pantries")
      .insert({ name: name.trim(), owner_id: userId })
      .select()
      .single();

    if (pantryError || !pantry) {
      return { success: false, error: "Błąd przy dodawaniu spiżarni" };
    }

    await get().fetchPantries();
    return { success: true };
  },

  removePantry: async (id) => {
    const { error } = await supabase.from("pantries").delete().eq("id", id);
    if (!error) {
      set((state) => ({
        pantries: state.pantries.filter((p) => p.id !== id),
      }));
    }
  },

  renamePantry: async (id, newName) => {
    await supabase.from("pantries").update({ name: newName }).eq("id", id);
  },

  addPantryItem: (item) => {
    set((state) => ({ pantryItems: [...state.pantryItems, item] }));
  },

  updatePantryItem: (item) => {
    set((state) => ({
      pantryItems: state.pantryItems.map((i) => (i.id === item.id ? item : i)),
    }));
  },

  deletePantryItem: async (id) => {
    const { error } = await supabase.from("pantry_items").delete().eq("id", id);
    if (!error) {
      set((state) => ({
        pantryItems: state.pantryItems.filter((i) => i.id !== id),
      }));
    }
  },

  updateItemQuantity: async (id, quantity) => {
    const { error } = await supabase
      .from("pantry_items")
      .update({ quantity })
      .eq("id", id);
    if (!error) {
      set((state) => ({
        pantryItems: state.pantryItems.map((i) =>
          i.id === id ? { ...i, quantity } : i
        ),
      }));
    }
  },
}));
