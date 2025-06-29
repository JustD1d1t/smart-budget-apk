import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { supabase } from "../../lib/supabaseClient";
import { Expense, Member, useExpensesStore } from "../expensesStore";

jest.mock("../../lib/supabaseClient", () => ({
  supabase: { from: jest.fn() },
}));

describe("ExpensesStore", () => {
  beforeEach(() => {
    useExpensesStore.setState({ expenses: [], loading: false });
    jest.clearAllMocks();
  });

  describe("fetchExpenses", () => {
    it("should fetch and filter expenses", async () => {
      const viewerLinks = [{ expense_id: "e1" }];
      const allExpenses: Expense[] = [
        {
          id: "e1",
          amount: 10,
          store: "S",
          date: "2025-01-01",
          category: "C",
          user_id: "u1",
        },
        {
          id: "e2",
          amount: 20,
          store: "S2",
          date: "2025-01-02",
          category: "C2",
          user_id: "u2",
        },
      ];
      // mock expense_viewers
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: () => ({
            eq: () => Promise.resolve({ data: viewerLinks, error: null }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            gte: () => ({
              lte: () => Promise.resolve({ data: allExpenses, error: null }),
            }),
          }),
        });

      await useExpensesStore
        .getState()
        .fetchExpenses("u1", "2025-01-01", "2025-01-31");
      const state = useExpensesStore.getState();
      expect(state.loading).toBe(false);
      expect(state.expenses).toEqual([allExpenses[0]]);
    });
  });

  describe("addExpense", () => {
    it("should add expense and viewers", async () => {
      const newExpense: Omit<Expense, "id"> = {
        amount: 30,
        store: "S3",
        date: "2025-02-01",
        category: "C3",
        user_id: "u3",
      };
      const inserted = { id: "e3", ...newExpense } as Expense;
      const shared: Member[] = [{ id: "u4", email: "a@b.com" }];

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: inserted, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: () => Promise.resolve({ data: null, error: null }),
        });

      const result = await useExpensesStore
        .getState()
        .addExpense(newExpense, shared);
      expect(result.success).toBe(true);
      expect(useExpensesStore.getState().expenses[0]).toEqual(inserted);
    });

    it("should return error on insert failure", async () => {
      const newExpense: Omit<Expense, "id"> = {
        amount: 30,
        store: "S3",
        date: "2025-02-01",
        category: "C3",
        user_id: "u3",
      };
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: {} }),
          }),
        }),
      });
      const result = await useExpensesStore.getState().addExpense(newExpense);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("updateExpense", () => {
    it("should update expense and viewers", async () => {
      const existing: Expense = {
        id: "e4",
        amount: 40,
        store: "S4",
        date: "2025-03-01",
        category: "C4",
        user_id: "u4",
      };
      useExpensesStore.setState({ expenses: [existing], loading: false });
      const updatedData = {
        amount: 50,
        store: "S5",
        date: "2025-03-02",
        category: "C5",
      };
      const shared: Member[] = [{ id: "u5", email: "b@c.com" }];

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          update: () => ({
            eq: () => ({ eq: () => Promise.resolve({ error: null }) }),
          }),
        })
        .mockReturnValueOnce({
          delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
        })
        .mockReturnValueOnce({
          insert: () => Promise.resolve({ data: null, error: null }),
        });

      const result = await useExpensesStore
        .getState()
        .updateExpense("e4", "u4", updatedData, shared);
      expect(result.success).toBe(true);
      expect(useExpensesStore.getState().expenses[0]).toMatchObject({
        id: "e4",
        ...updatedData,
      });
    });

    it("should return error on update failure", async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: () => ({
          eq: () => ({ eq: () => Promise.resolve({ error: {} }) }),
        }),
      });
      const result = await useExpensesStore
        .getState()
        .updateExpense(
          "e5",
          "u5",
          { amount: 0, store: "", date: "", category: "" },
          []
        );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("deleteExpense", () => {
    it("should delete own expense", async () => {
      const e: Expense = {
        id: "e6",
        amount: 60,
        store: "S6",
        date: "2025-04-01",
        category: "C6",
        user_id: "u6",
      };
      useExpensesStore.setState({ expenses: [e], loading: false });
      (supabase.from as jest.Mock).mockReturnValue({
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      });

      const result = await useExpensesStore
        .getState()
        .deleteExpense("e6", "u6");
      expect(result.success).toBe(true);
      expect(useExpensesStore.getState().expenses).toHaveLength(0);
    });

    it("should prevent deleting others expense", async () => {
      const e: Expense = {
        id: "e7",
        amount: 70,
        store: "S7",
        date: "2025-05-01",
        category: "C7",
        user_id: "u7",
      };
      useExpensesStore.setState({ expenses: [e], loading: false });
      const result = await useExpensesStore
        .getState()
        .deleteExpense("e7", "other");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Brak uprawnień lub wydatek nie istnieje");
    });
  });

  describe("setExpenses", () => {
    it("should set expenses state", () => {
      const arr: Expense[] = [
        {
          id: "e8",
          amount: 80,
          store: "S8",
          date: "2025-06-01",
          category: "C8",
          user_id: "u8",
        },
      ];
      useExpensesStore.getState().setExpenses(arr);
      expect(useExpensesStore.getState().expenses).toEqual(arr);
    });
  });
});
