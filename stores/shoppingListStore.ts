import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";

export interface Member {
  id: string;
  email: string;
}

export interface ShoppingList {
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

export interface ShoppingListItem {
  id: string;
  list_id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  bought: boolean;
}

interface ShoppingListStore {
  lists: ShoppingList[];
  items: ShoppingListItem[];
  selectedList: ShoppingList | null;
  isOwner: boolean;
  members: Viewer[];
  membersLoading: boolean;

  fetchLists: () => Promise<{ success: boolean; error?: string }>;
  fetchListDetails: (
    listId: string
  ) => Promise<{ success: boolean; error?: string }>;
  fetchListItems: (
    listId: string
  ) => Promise<{ success: boolean; error?: string }>;
  addList: (name: string) => Promise<{ success: boolean; error?: string }>;
  removeList: (id: string) => Promise<{ success: boolean; error?: string }>;
  renameList: (
    id: string,
    newName: string
  ) => Promise<{ success: boolean; error?: string }>;
  addItem: (item: ShoppingListItem) => { success: boolean; error?: string };
  updateItem: (item: ShoppingListItem) => { success: boolean; error?: string };
  deleteItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  fetchMembers: (
    listId: string
  ) => Promise<{ success: boolean; error?: string }>;
  addMember: (
    listId: string,
    friendEmail: string
  ) => Promise<{ success: boolean; error?: string }>;
  removeMember: (
    listId: string,
    friendEmail: string
  ) => Promise<{ success: boolean; error?: string }>;
  toggleItem: (
    itemId: string,
    current: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  editItem: (
    item: ShoppingListItem
  ) => Promise<{ success: boolean; error?: string }>;
  deleteBoughtItems: (
    listId: string
  ) => Promise<{ success: boolean; error?: string }>;
  moveBoughtToPantry: (
    pantryId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export const useShoppingListStore = create<ShoppingListStore>((set, get) => ({
  lists: [],
  items: [],
  selectedList: null,
  isOwner: false,
  members: [],
  membersLoading: false,

  moveBoughtToPantry: async (pantryId) => {
    try {
      const state = get();
      const boughtItems = state.items.filter((i) => i.bought);
      if (boughtItems.length === 0)
        throw new Error("Brak kupionych produktów do przeniesienia.");
      const toInsert = boughtItems.map((i) => ({
        pantry_id: pantryId,
        name: i.name,
        category: i.category,
        quantity: i.quantity,
        unit: i.unit,
      }));
      let { error } = await supabase.from("pantry_items").insert(toInsert);
      if (error) throw error;
      ({ error } = await supabase
        .from("shopping_items")
        .delete()
        .in(
          "id",
          boughtItems.map((i) => i.id)
        ));
      if (error) throw error;
      set({ items: state.items.filter((i) => !i.bought) });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  deleteBoughtItems: async () => {
    try {
      const state = get();
      const boughtIds = state.items.filter((i) => i.bought).map((i) => i.id);
      if (boughtIds.length === 0) return { success: true };
      const { error } = await supabase
        .from("shopping_items")
        .delete()
        .in("id", boughtIds);
      if (error) throw error;
      set({ items: state.items.filter((i) => !i.bought) });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
  toggleItem: async (itemId, current) => {
    try {
      const { error } = await supabase
        .from("shopping_items")
        .update({ bought: !current })
        .eq("id", itemId);
      if (error) throw error;
      set((state) => ({
        items: state.items.map((item) =>
          item.id === itemId ? { ...item, bought: !current } : item
        ),
      }));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
  editItem: async (item: ShoppingListItem) => {
    try {
      const { error } = await supabase
        .from("shopping_items")
        .update({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
        })
        .eq("id", item.id);
      if (error) throw error;
      set((state) => ({
        items: state.items.map((i) => (i.id === item.id ? item : i)),
      }));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  fetchLists: async () => {
    try {
      const { data: userData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !userData.user)
        throw new Error(authError?.message || "No user");
      const userId = userData.user.id;

      const { data: ownedLists, error: ownError } = await supabase
        .from("shopping_lists")
        .select("*")
        .eq("owner_id", userId);
      if (ownError) throw ownError;

      const { data: memberLinks, error: linkError } = await supabase
        .from("shopping_list_members")
        .select("list_id")
        .eq("user_id", userId);
      if (linkError) throw linkError;
      const sharedIds = memberLinks?.map((l) => l.list_id) || [];

      const { data: sharedLists, error: sharedError } = sharedIds.length
        ? await supabase
            .from("shopping_lists")
            .select("*")
            .in("id", sharedIds)
            .neq("owner_id", userId)
        : { data: [] };
      if (sharedError) throw sharedError;

      const combined = [...(ownedLists || []), ...(sharedLists || [])];
      const withOwnership = combined.map((l) => ({
        ...l,
        isOwner: l.owner_id === userId,
      }));

      set({ lists: withOwnership });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  fetchListDetails: async (id) => {
    try {
      const { data: userData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !userData.user)
        throw new Error(authError?.message || "No user");
      const userId = userData.user.id;

      const { data, error } = await supabase
        .from("shopping_lists")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) throw error || new Error("List not found");

      set({ selectedList: data, isOwner: data.owner_id === userId });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  fetchListItems: async (listId) => {
    try {
      const { data, error } = await supabase
        .from("shopping_items")
        .select("*")
        .eq("list_id", listId);
      if (error) throw error;

      set({ items: data || [] });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  addList: async (name) => {
    try {
      const { data: userData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !userData.user)
        throw new Error(authError?.message || "No user");
      const userId = userData.user.id;

      const { data: list, error } = await supabase
        .from("shopping_lists")
        .insert({ name: name.trim(), owner_id: userId })
        .select()
        .single();
      if (error || !list) throw error || new Error("Error creating list");

      await get().fetchLists();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  removeList: async (id) => {
    try {
      const { error } = await supabase
        .from("shopping_lists")
        .delete()
        .eq("id", id);
      if (error) throw error;

      set((state) => ({ lists: state.lists.filter((l) => l.id !== id) }));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  renameList: async (id, newName) => {
    try {
      const { error } = await supabase
        .from("shopping_lists")
        .update({ name: newName })
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  addItem: (item) => {
    try {
      set((state) => ({ items: [...state.items, item] }));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  updateItem: (item) => {
    try {
      set((state) => ({
        items: state.items.map((i) => (i.id === item.id ? item : i)),
      }));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  deleteItem: async (id) => {
    try {
      const { error } = await supabase
        .from("shopping_list_items")
        .delete()
        .eq("id", id);
      if (error) throw error;

      set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  fetchMembers: async (listId) => {
    try {
      set({ membersLoading: true });
      const { data, error } = await supabase
        .from("shopping_list_members")
        .select("id, email, role")
        .eq("list_id", listId);
      if (error) throw error;
      set({
        members: data || [],
        membersLoading: false,
      });
      return { success: true };
    } catch (error: any) {
      set({ membersLoading: false });
      return { success: false, error: error.message };
    }
  },

  addMember: async (listId, friendEmail) => {
    try {
      // 1. fetch user by email
      const { data: userData, error: userErr } = await supabase
        .from("users")
        .select("id")
        .eq("email", friendEmail)
        .single();
      if (userErr || !userData)
        throw new Error("Nie znaleziono użytkownika o podanym e-mailu.");

      // 2. check existing membership
      const { data: existing, error: checkErr } = await supabase
        .from("shopping_list_members")
        .select("id")
        .eq("list_id", listId)
        .eq("user_id", userData.id);
      if (checkErr) throw new Error("Nie udało się sprawdzić współtwórców.");
      if (existing && existing.length > 0)
        throw new Error("Użytkownik jest już współtwórcą tej listy.");

      // 3. insert membership
      const { error: insertErr } = await supabase
        .from("shopping_list_members")
        .insert({
          list_id: listId,
          user_id: userData.id,
          email: friendEmail,
          role: "member",
        });
      if (insertErr) throw insertErr;

      // 4. odśwież
      await get().fetchMembers(listId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  removeMember: async (listId, friendEmail) => {
    try {
      // 1. lookup user
      const { data: userData, error: userErr } = await supabase
        .from("users")
        .select("id")
        .eq("email", friendEmail)
        .single();
      if (userErr || !userData)
        throw new Error("Nie znaleziono użytkownika o podanym e-mailu.");

      // 2. check membership
      const { data: existing, error: checkErr } = await supabase
        .from("shopping_list_members")
        .select("id")
        .eq("list_id", listId)
        .eq("user_id", userData.id);
      if (checkErr) throw new Error("Nie udało się sprawdzić współtwórców.");
      if (!existing || existing.length === 0)
        throw new Error("Użytkownik nie jest współtwórcą tej listy.");

      // 3. delete
      const { error: deleteErr } = await supabase
        .from("shopping_list_members")
        .delete()
        .eq("list_id", listId)
        .eq("user_id", userData.id);
      if (deleteErr) throw deleteErr;

      // 4. odśwież
      await get().fetchMembers(listId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
}));
