import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { supabase } from "../../lib/supabaseClient";
import { Pantry, PantryItem, usePantriesStore } from "../pantriesStore";

jest.mock("../../lib/supabaseClient", () => ({
  supabase: { from: jest.fn(), auth: { getUser: jest.fn() } },
}));

describe("PantriesStore", () => {
  beforeEach(() => {
    usePantriesStore.setState({
      pantries: [],
      pantryItems: [],
      selectedPantry: null,
      isOwner: false,
      loading: false,
      members: [],
    });
    jest.clearAllMocks();
  });

  describe("fetchPantries", () => {
    it("should fetch owned pantries and set state", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "u1" } },
        error: null,
      });
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () =>
              Promise.resolve({
                data: [{ id: "p1", name: "Pantry1", owner_id: "u1" }],
                error: null,
              }),
          }),
        });

      const result = await usePantriesStore.getState().fetchPantries();
      expect(result.success).toBe(true);
      expect(usePantriesStore.getState().pantries).toHaveLength(1);
      expect(usePantriesStore.getState().pantries[0]).toMatchObject({
        id: "p1",
        isOwner: true,
      });
      expect(usePantriesStore.getState().loading).toBe(false);
    });

    it("should handle auth error", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: {},
        error: new Error("Auth fail"),
      });
      const result = await usePantriesStore.getState().fetchPantries();
      expect(result.success).toBe(false);
      expect(usePantriesStore.getState().loading).toBe(false);
    });
  });

  describe("fetchPantryDetails", () => {
    it("should fetch and set selected pantry", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "u2" } },
        error: null,
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: { id: "p2", owner_id: "u2", name: "Test" },
                error: null,
              }),
          }),
        }),
      });

      const result = await usePantriesStore.getState().fetchPantryDetails("p2");
      expect(result.success).toBe(true);
      expect(usePantriesStore.getState().selectedPantry?.id).toBe("p2");
      expect(usePantriesStore.getState().isOwner).toBe(true);
    });

    it("should return error if no user", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: {},
        error: new Error("No user"),
      });
      const result = await usePantriesStore.getState().fetchPantryDetails("p2");
      expect(result.success).toBe(false);
      expect(result.error).toBe("No user");
    });
  });

  describe("fetchPantryItems", () => {
    it("should fetch and set pantry items", async () => {
      const items: PantryItem[] = [
        {
          id: "i1",
          pantry_id: "p",
          name: "A",
          category: "C",
          quantity: 1,
          unit: "u",
          expiry_date: null,
        },
      ];
      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          eq: () => Promise.resolve({ data: items, error: null }),
        }),
      });

      const result = await usePantriesStore.getState().fetchPantryItems("p");
      expect(result.success).toBe(true);
      expect(usePantriesStore.getState().pantryItems).toEqual(items);
    });

    it("should return error on db failure", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: () => ({
          eq: () => Promise.resolve({ data: null, error: new Error("fail") }),
        }),
      });
      const result = await usePantriesStore.getState().fetchPantryItems("p");
      expect(result.success).toBe(false);
      expect(result.error).toBe("fail");
    });
  });

  describe("addPantry", () => {
    it("should create pantry and refresh list", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "u3" } },
        error: null,
      });
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({ data: { id: "p3" }, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        });

      const result = await usePantriesStore.getState().addPantry("New");
      expect(result.success).toBe(true);
    });

    it("should return error when auth fails", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: {},
        error: new Error("no"),
      });
      const result = await usePantriesStore.getState().addPantry("X");
      expect(result.success).toBe(false);
    });
  });

  describe("removePantry & renamePantry", () => {
    it("should remove pantry on success", async () => {
      usePantriesStore.setState({
        pantries: [{ id: "p4", name: "N", owner_id: "u4" } as Pantry],
      });
      (supabase.from as jest.Mock).mockReturnValue({
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      });
      const result = await usePantriesStore.getState().removePantry("p4");
      expect(result.success).toBe(true);
      expect(usePantriesStore.getState().pantries).toHaveLength(0);
    });

    it("should rename pantry", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      });
      const result = await usePantriesStore
        .getState()
        .renamePantry("p5", "NewName");
      expect(result.success).toBe(true);
    });
  });

  describe("updatePantryItem & deletePantryItem", () => {
    it("should update pantry item", async () => {
      const item: PantryItem = {
        id: "i2",
        pantry_id: "p",
        name: "B",
        category: "C",
        quantity: 2,
        unit: "u",
        expiry_date: null,
      };
      usePantriesStore.setState({ pantryItems: [item] });
      (supabase.from as jest.Mock).mockReturnValue({
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      });
      const changed = { ...item, name: "B2" };
      const result = await usePantriesStore
        .getState()
        .updatePantryItem(changed);
      expect(result.success).toBe(true);
      expect(
        usePantriesStore.getState().pantryItems.find((i) => i.id === "i2")?.name
      ).toBe("B2");
    });

    it("should delete pantry item", async () => {
      const item = {
        id: "i3",
        pantry_id: "p",
        name: "C",
        category: "C",
        quantity: 3,
        unit: "u",
        expiry_date: null,
      };
      usePantriesStore.setState({ pantryItems: [item] });
      (supabase.from as jest.Mock).mockReturnValue({
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      });
      const result = await usePantriesStore.getState().deletePantryItem("i3");
      expect(result.success).toBe(true);
      expect(usePantriesStore.getState().pantryItems).toHaveLength(0);
    });
  });

  describe("updateItemQuantity", () => {
    it("should update quantity on success", async () => {
      const existing: PantryItem = {
        id: "i4",
        pantry_id: "p",
        name: "D",
        category: "Cat",
        quantity: 5,
        unit: "u",
        expiry_date: null,
      };
      usePantriesStore.setState({ pantryItems: [existing] });
      (supabase.from as jest.Mock).mockReturnValue({
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      });
      const result = await usePantriesStore
        .getState()
        .updateItemQuantity("i4", 10);
      expect(result.success).toBe(true);
      expect(
        usePantriesStore.getState().pantryItems.find((i) => i.id === "i4")
          ?.quantity
      ).toBe(10);
    });

    it("should return error on failure", async () => {
      const existing: PantryItem = {
        id: "i4",
        pantry_id: "p",
        name: "D",
        category: "Cat",
        quantity: 5,
        unit: "u",
        expiry_date: null,
      };
      usePantriesStore.setState({ pantryItems: [existing] });
      (supabase.from as jest.Mock).mockReturnValue({
        update: () => ({
          eq: () => Promise.resolve({ error: new Error("qty fail") }),
        }),
      });
      const result = await usePantriesStore
        .getState()
        .updateItemQuantity("i4", 20);
      expect(result.success).toBe(false);
    });
  });

  // describe("fetchMembers, addMember & removeMember", async () => {
  //   it("should fetch and set members", async () => {
  //     const fake: Viewer[] = [{ id: "1", email: "a@b.com", role: "member" }];
  //     (supabase.from as jest.Mock).mockReturnValue({
  //       select: () => ({
  //         eq: () => Promise.resolve({ data: fake, error: null }),
  //       }),
  //     });
  //     const res = await usePantriesStore.getState().fetchMembers("p");
  //     expect(res.success).toBe(true);
  //     expect(usePantriesStore.getState().members).toEqual(fake);
  //   });

  //   it("addMember success", async () => {
  //     jest
  //       .spyOn(usePantriesStore.getState(), "fetchPantryDetails")
  //       .mockResolvedValue({ success: true });
  //     const user = { id: "u5" };
  //     (supabase.from as jest.Mock)
  //       .mockReturnValueOnce({
  //         select: () => ({
  //           eq: () => ({
  //             limit: () => ({
  //               single: () => Promise.resolve({ data: user, error: null }),
  //             }),
  //           }),
  //         }),
  //       })
  //       .mockReturnValueOnce({
  //         select: () => ({
  //           eq: () => ({
  //             eq: () => Promise.resolve({ data: [], error: null }),
  //           }),
  //         }),
  //       })
  //       .mockReturnValueOnce({ insert: () => ({ error: null }) });
  //     const spy = jest.spyOn(usePantriesStore.getState(), "fetchPantryDetails");
  //     const res = await usePantriesStore.getState().addMember("p", "x@y.com");
  //     expect(res.success).toBe(true);
  //     expect(spy).toHaveBeenCalledWith("p");
  //   });

  //   it("removeMember success", async () => {
  //     // stub fetchPantryDetails to avoid internal call
  //     jest
  //       .spyOn(usePantriesStore.getState(), "fetchPantryDetails")
  //       .mockResolvedValue({ success: true });
  //     // user lookup
  //     const user = { id: "u6" };
  //     (supabase.from as jest.Mock)
  //       .mockReturnValueOnce({
  //         select: () => ({
  //           eq: () => ({
  //             limit: () => ({
  //               single: () => Promise.resolve({ data: user, error: null }),
  //             }),
  //           }),
  //         }),
  //       })
  //       // membership check
  //       .mockReturnValueOnce({
  //         select: () => ({
  //           eq: () => ({
  //             eq: () => Promise.resolve({ data: [{ id: "m1" }], error: null }),
  //           }),
  //         }),
  //       })
  //       // delete with nested eq chaining
  //       .mockReturnValueOnce({
  //         delete: () => ({
  //           eq: () => ({ eq: () => Promise.resolve({ error: null }) }),
  //         }),
  //       });
  //     const spy = jest.spyOn(usePantriesStore.getState(), "fetchPantryDetails");
  //     const res = await usePantriesStore
  //       .getState()
  //       .removeMember("p", "x@y.com");
  //     expect(res.success).toBe(true);
  //     expect(spy).toHaveBeenCalledWith("p");
  //   });
  //   const user = { id: "u6" };
  //   (supabase.from as jest.Mock)
  //     .mockReturnValueOnce({
  //       select: () => ({
  //         eq: () => ({
  //           limit: () => ({
  //             single: () => Promise.resolve({ data: user, error: null }),
  //           }),
  //         }),
  //       }),
  //     })
  //     .mockReturnValueOnce({
  //       select: () => ({
  //         eq: () => ({
  //           eq: () => Promise.resolve({ data: [{ id: "m1" }], error: null }),
  //         }),
  //       }),
  //     })
  //     .mockReturnValueOnce({
  //       delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
  //     });
  //   const spy = jest.spyOn(usePantriesStore.getState(), "fetchPantryDetails");
  //   const res = await usePantriesStore.getState().removeMember("p", "x@y.com");
  //   expect(res.success).toBe(true);
  //   expect(spy).toHaveBeenCalledWith("p");
  // });
});
