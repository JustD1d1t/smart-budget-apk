import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { supabase } from "../../lib/supabaseClient";
import {
    ShoppingList,
    ShoppingListItem,
    useShoppingListStore,
    Viewer,
} from "../shoppingListStore";

jest.mock("../../lib/supabaseClient", () => ({
  supabase: { from: jest.fn(), auth: { getUser: jest.fn() } },
}));

describe("ShoppingListStore", () => {
  beforeEach(() => {
    useShoppingListStore.setState({
      lists: [],
      items: [],
      selectedList: null,
      isOwner: false,
      members: [],
      membersLoading: false,
    });
    jest.clearAllMocks();
  });

  describe("deleteBoughtItems", () => {
    it("deletes only bought items", async () => {
      const items: ShoppingListItem[] = [
        {
          id: "1",
          list_id: "l",
          name: "A",
          category: "C",
          quantity: 1,
          unit: "u",
          bought: true,
        },
        {
          id: "2",
          list_id: "l",
          name: "B",
          category: "C",
          quantity: 2,
          unit: "u",
          bought: false,
        },
      ];
      useShoppingListStore.setState({ items });
      (supabase.from as jest.Mock).mockReturnValue({
        delete: () => ({ in: () => Promise.resolve({ error: null }) }),
      });

      const result = await useShoppingListStore.getState().deleteBoughtItems();
      expect(result.success).toBe(true);
      expect(useShoppingListStore.getState().items).toEqual([items[1]]);
    });

    it("no-ops if none bought", async () => {
      useShoppingListStore.setState({
        items: [
          {
            id: "1",
            list_id: "l",
            name: "A",
            category: "C",
            quantity: 1,
            unit: "u",
            bought: false,
          },
        ],
      });
      const result = await useShoppingListStore.getState().deleteBoughtItems();
      expect(result.success).toBe(true);
      expect(useShoppingListStore.getState().items).toHaveLength(1);
    });
  });

  describe("toggleItem", () => {
    it("toggles bought flag", async () => {
      const item: ShoppingListItem = {
        id: "3",
        list_id: "l",
        name: "C",
        category: "C",
        quantity: 1,
        unit: "u",
        bought: false,
      };
      useShoppingListStore.setState({ items: [item] });
      (supabase.from as jest.Mock).mockReturnValue({
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      });

      const result = await useShoppingListStore
        .getState()
        .toggleItem("3", false);
      expect(result.success).toBe(true);
      expect(useShoppingListStore.getState().items[0].bought).toBe(true);
    });

    it("handles db error", async () => {
      const item: ShoppingListItem = {
        id: "3",
        list_id: "l",
        name: "C",
        category: "C",
        quantity: 1,
        unit: "u",
        bought: false,
      };
      useShoppingListStore.setState({ items: [item] });
      (supabase.from as jest.Mock).mockReturnValue({
        update: () => ({
          eq: () => Promise.resolve({ error: new Error("fail") }),
        }),
      });

      const result = await useShoppingListStore
        .getState()
        .toggleItem("3", false);
      expect(result.success).toBe(false);
      expect(useShoppingListStore.getState().items[0].bought).toBe(false);
    });
  });

  describe("editItem", () => {
    it("edits item successfully", async () => {
      const item: ShoppingListItem = {
        id: "4",
        list_id: "l",
        name: "D",
        category: "C",
        quantity: 1,
        unit: "u",
        bought: false,
      };
      useShoppingListStore.setState({ items: [item] });
      const updated = { ...item, name: "D2", quantity: 5 };
      (supabase.from as jest.Mock).mockReturnValue({
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      });

      const result = await useShoppingListStore.getState().editItem(updated);
      expect(result.success).toBe(true);
      expect(useShoppingListStore.getState().items[0]).toEqual(updated);
    });

    it("handles db error on edit", async () => {
      const item: ShoppingListItem = {
        id: "4",
        list_id: "l",
        name: "D",
        category: "C",
        quantity: 1,
        unit: "u",
        bought: false,
      };
      useShoppingListStore.setState({ items: [item] });
      (supabase.from as jest.Mock).mockReturnValue({
        update: () => ({
          eq: () => Promise.resolve({ error: new Error("fail") }),
        }),
      });

      const result = await useShoppingListStore.getState().editItem(item);
      expect(result.success).toBe(false);
      expect(useShoppingListStore.getState().items[0]).toEqual(item);
    });
  });

  describe("moveBoughtToPantry", () => {
    it("moves bought to pantry and deletes", async () => {
      const items: ShoppingListItem[] = [
        {
          id: "1",
          list_id: "l",
          name: "A",
          category: "C",
          quantity: 1,
          unit: "u",
          bought: true,
        },
        {
          id: "2",
          list_id: "l",
          name: "B",
          category: "C",
          quantity: 2,
          unit: "u",
          bought: false,
        },
      ];
      useShoppingListStore.setState({ items });
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ insert: () => Promise.resolve({ error: null }) })
        .mockReturnValueOnce({
          delete: () => ({ in: () => Promise.resolve({ error: null }) }),
        });

      const result = await useShoppingListStore
        .getState()
        .moveBoughtToPantry("pan1");
      expect(result.success).toBe(true);
      expect(useShoppingListStore.getState().items).toEqual([items[1]]);
    });

    it("errors when no bought items", async () => {
      useShoppingListStore.setState({
        items: [
          {
            id: "2",
            list_id: "l",
            name: "B",
            category: "C",
            quantity: 2,
            unit: "u",
            bought: false,
          },
        ],
      });
      const result = await useShoppingListStore
        .getState()
        .moveBoughtToPantry("pan1");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Brak kupionych produktów do przeniesienia.");
    });
  });

  describe("fetchLists and details", () => {
    it("fetchLists gets owned and shared", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "u1" } },
        error: null,
      });
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: () => ({
            eq: () =>
              Promise.resolve({
                data: [{ id: "l1", name: "L1", owner_id: "u1" }],
                error: null,
              }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () =>
              Promise.resolve({ data: [{ list_id: "l2" }], error: null }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            in: () => ({
              neq: () =>
                Promise.resolve({
                  data: [{ id: "l2", name: "L2", owner_id: "u2" }],
                  error: null,
                }),
            }),
          }),
        });

      const res = await useShoppingListStore.getState().fetchLists();
      expect(res.success).toBe(true);
      const lists = useShoppingListStore.getState().lists;
      expect(lists.find((l) => l.id === "l1")?.isOwner).toBe(true);
      expect(lists.find((l) => l.id === "l2")?.isOwner).toBe(false);
    });

    it("fetchListDetails works or errors", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "u2" } },
        error: null,
      });
      const list: ShoppingList = { id: "l3", name: "L3", owner_id: "u2" };
      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: list, error: null }),
          }),
        }),
      });

      const ok = await useShoppingListStore.getState().fetchListDetails("l3");
      expect(ok.success).toBe(true);
      expect(useShoppingListStore.getState().isOwner).toBe(true);

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: {},
        error: new Error("no"),
      });
      const err = await useShoppingListStore.getState().fetchListDetails("l3");
      expect(err.success).toBe(false);
    });
  });

  describe("add/remove/rename list", () => {
    it("addList, removeList, renameList", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "u3" } },
        error: null,
      });
      const newL = { id: "l4", name: "N", owner_id: "u3" };
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: newL, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        });
      expect((await useShoppingListStore.getState().addList("N")).success).toBe(
        true
      );

      useShoppingListStore.setState({ lists: [newL] });
      (supabase.from as jest.Mock).mockReturnValue({
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      });
      expect(
        (await useShoppingListStore.getState().removeList("l4")).success
      ).toBe(true);

      (supabase.from as jest.Mock).mockReturnValue({
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      });
      expect(
        (await useShoppingListStore.getState().renameList("l4", "X")).success
      ).toBe(true);
    });
  });

  describe("item sync operations", () => {
    it("addItem and updateItem", () => {
      const item: ShoppingListItem = {
        id: "i5",
        list_id: "l",
        name: "Z",
        quantity: 1,
        unit: "u",
        category: "C",
        bought: false,
      };
      expect(useShoppingListStore.getState().addItem(item).success).toBe(true);
      expect(useShoppingListStore.getState().items).toContainEqual(item);

      const upd = { ...item, name: "Z2" };
      expect(useShoppingListStore.getState().updateItem(upd).success).toBe(
        true
      );
      expect(useShoppingListStore.getState().items[0].name).toBe("Z2");
    });

    it("deleteItem async", async () => {
      const item: ShoppingListItem = {
        id: "i6",
        list_id: "l",
        name: "Y",
        quantity: 2,
        unit: "u",
        category: "C",
        bought: false,
      };
      useShoppingListStore.setState({ items: [item] });
      (supabase.from as jest.Mock).mockReturnValue({
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      });
      expect(
        (await useShoppingListStore.getState().deleteItem("i6")).success
      ).toBe(true);
      expect(useShoppingListStore.getState().items).toHaveLength(0);
    });
  });

  describe("member management", () => {
    it("fetchMembers", async () => {
      const viewers: Viewer[] = [{ id: "v1", email: "e", role: "member" }];
      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          eq: () => Promise.resolve({ data: viewers, error: null }),
        }),
      });
      expect(
        (await useShoppingListStore.getState().fetchMembers("l")).success
      ).toBe(true);
      expect(useShoppingListStore.getState().members).toEqual(viewers);
    });

    it("addMember & removeMember", async () => {
      jest
        .spyOn(useShoppingListStore.getState(), "fetchMembers")
        .mockResolvedValue({ success: true });
      const u = { id: "u7" };
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: u, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({ insert: () => ({ error: null }) });
      expect(
        (await useShoppingListStore.getState().addMember("l", "e")).success
      ).toBe(true);

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: u, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({ data: [{ id: "m" }], error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          delete: () => ({
            eq: () => ({ eq: () => Promise.resolve({ error: null }) }),
          }),
        });
      expect(
        (await useShoppingListStore.getState().removeMember("l", "e")).success
      ).toBe(true);
    });
  });
});
