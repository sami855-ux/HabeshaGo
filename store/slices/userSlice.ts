import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getMe } from "@/services/auth.user.api";
import { User } from "@/types/user";

interface UserState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: UserState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
};

// ✅ Async thunk (NO store import here)
export const fetchCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: { message: string } }
>("user/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const response = await getMe();
    return response.user;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data ?? { message: "Failed to fetch user" }
    );
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    // ✅ FIXED TYPE
    updateUser(
      state,
      action: PayloadAction<Partial<NonNullable<UserState["user"]>>>
    ) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    clearUser(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const { setUser, updateUser, clearUser, setLoading, setAccessToken } =
  userSlice.actions;

export default userSlice.reducer;
