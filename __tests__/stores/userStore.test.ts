import { Session, User } from "@supabase/supabase-js";
import { act } from "@testing-library/react-native";
import { supabase } from "../../lib/supabaseClient";
import { useUserStore } from "../../stores/userStore";

// Mock supabase.auth.signOut and getSession
jest.mock("../../lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

describe("useUserStore", () => {
  const mockUser: User = {
    id: "u1",
    email: "a@b.c",
    app_metadata: {},
    user_metadata: {},
    aud: "",
    created_at: "",
    role: "",
  };
  const mockSession: Session = {
    access_token: "token",
    token_type: "bearer",
    expires_in: 3600,
    refresh_token: "ref",
    user: mockUser,
  };

  beforeEach(() => {
    useUserStore.setState({ user: null, session: null, loading: true });
    jest.clearAllMocks();
  });

  it("initial state is loading=true, user and session null", () => {
    const state = useUserStore.getState();
    expect(state.loading).toBe(true);
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
  });

  it("setUser updates user and session", () => {
    act(() => {
      useUserStore.getState().setUser(mockUser, mockSession);
    });
    const { user, session } = useUserStore.getState();
    expect(user).toEqual(mockUser);
    expect(session).toEqual(mockSession);
  });

  it("logout calls supabase.auth.signOut and resets state", async () => {
    // seed state
    act(() => {
      useUserStore.getState().setUser(mockUser, mockSession);
    });
    let promise;
    await act(async () => {
      promise = useUserStore.getState().logout();
      await promise;
    });
    expect(supabase.auth.signOut).toHaveBeenCalled();
    const { user, session } = useUserStore.getState();
    expect(user).toBeNull();
    expect(session).toBeNull();
  });
});
