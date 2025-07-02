import { act } from "react";

import { supabase } from "../../lib/supabaseClient";
import { Friend, useFriendsStore } from "../../stores/friendsStore";

// Reset modules and mock before importing store
jest.resetModules();
jest.mock("../../lib/supabaseClient", () => {
  const mockFromBuilder = () => ({
    select: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  });
  return {
    supabase: {
      auth: { getUser: jest.fn() },
      from: jest.fn(() => mockFromBuilder()),
    },
  };
});

describe("useFriendsStore", () => {
  beforeEach(() => {
    useFriendsStore.setState({ friends: [] });
    jest.clearAllMocks();
  });

  it("fetchFriends: successful fetch populates friends", async () => {
    // Mock authenticated user
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user1" } },
    });
    const row = {
      id: "f1",
      requester_id: "user1",
      recipient_id: "user2",
      status: "pending",
      created_at: "2025-06-28",
      requester: { email: "a" },
      recipient: { email: "b" },
    };
    // Mock supabase.from for friends table
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      or: jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: [row], error: null })),
    }));

    const res = await act(async () =>
      useFriendsStore.getState().fetchFriends()
    );
    expect(res).toEqual({ success: true });

    const friends = useFriendsStore.getState().friends;
    expect(friends).toHaveLength(1);
    expect(friends[0]).toEqual<Friend>({
      id: "f1",
      requester_id: "user1",
      recipient_id: "user2",
      status: "pending",
      created_at: "2025-06-28",
      user_email: "b",
    });
  });

  it("fetchFriends: error when no user", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
    });
    const res = await act(async () =>
      useFriendsStore.getState().fetchFriends()
    );
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Brak zalogowanego użytkownika/);
  });

  it("sendInvite: successful invite and refresh", async () => {
    // Mock users lookup then invite insert
    (supabase.from as jest.Mock)
      .mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockReturnValue(
            Promise.resolve({ data: { id: "u2" }, error: null })
          ),
      }))
      .mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnValue(Promise.resolve({ error: null })),
      }));

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "u1" } },
    });
    const spy = jest
      .spyOn(useFriendsStore.getState(), "fetchFriends")
      .mockResolvedValue({ success: true });

    const res = await act(async () =>
      useFriendsStore.getState().sendInvite("test@example.com")
    );
    expect(res).toEqual({ success: true });
    expect(spy).toHaveBeenCalled();
  });

  it("sendInvite: error if user not found", async () => {
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockReturnValue(
          Promise.resolve({ data: null, error: new Error("err") })
        ),
    }));

    const res = await act(async () =>
      useFriendsStore.getState().sendInvite("test@example.com")
    );
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Nie znaleziono użytkownika/);
  });

  it("acceptInvite: successful update and refresh", async () => {
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnValue(Promise.resolve({ error: null })),
    }));
    const spy = jest
      .spyOn(useFriendsStore.getState(), "fetchFriends")
      .mockResolvedValue({ success: true });

    const res = await act(async () =>
      useFriendsStore.getState().acceptInvite("f1")
    );
    expect(res).toEqual({ success: true });
    expect(spy).toHaveBeenCalled();
  });

  it("removeFriend: successful delete and refresh", async () => {
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnValue(Promise.resolve({ error: null })),
    }));
    const spy = jest
      .spyOn(useFriendsStore.getState(), "fetchFriends")
      .mockResolvedValue({ success: true });

    const res = await act(async () =>
      useFriendsStore.getState().removeFriend("f1")
    );
    expect(res).toEqual({ success: true });
    expect(spy).toHaveBeenCalled();
  });
});
