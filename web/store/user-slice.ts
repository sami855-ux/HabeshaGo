import { getMe } from "@/services"
import type { User } from "@/types/user"
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"

interface UserState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error?: string
  isReady: boolean
}

interface EstablishedSession {
  accessToken: string
  user: User
}

const initialState: UserState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true,
  error: undefined,
  isReady: false,
}

export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMe()
      if (!response?.user) {
        throw new Error("No user profile returned")
      }
      const backendUser = response.user

      if (typeof window !== "undefined") {
        const cachedUser = localStorage.getItem("habeshagoUser")
        if (!cachedUser || JSON.stringify(backendUser) !== cachedUser) {
          localStorage.setItem("habeshagoUser", JSON.stringify(backendUser))
        }
      }

      return backendUser
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? { message: error.message }
          : { message: "Failed to fetch user" },
      )
    }
  },
)

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: UserState["user"] }>) => {
      state.user = action.payload.user
      state.isAuthenticated = true
      state.loading = false
      state.isReady = true
    },
    establishSession: (
      state,
      action: PayloadAction<EstablishedSession>,
    ) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
      state.loading = false
      state.error = undefined
      state.isReady = true
    },
    updateUser: (state, action: PayloadAction<Partial<UserState["user"]>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    clearUser: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.loading = false
      state.isReady = true
      if (typeof window !== "undefined") {
        localStorage.removeItem("habeshagoUser")
      }
    },
    markReady: (state) => {
      state.isReady = true
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
      state.isAuthenticated = true
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true
      })
      .addCase(
        fetchCurrentUser.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.user = action.payload
          state.isAuthenticated = true
          state.loading = false
          state.isReady = true
        },
      )
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.isReady = true
        state.error =
          typeof action.payload === "object" &&
          action.payload !== null &&
          "message" in action.payload
            ? String(action.payload.message)
            : "Failed to fetch user"
      })
  },
})

export const {
  setUser,
  establishSession,
  updateUser,
  clearUser,
  setLoading,
  setAccessToken,
  setError,
  markReady,
} = userSlice.actions

export default userSlice.reducer
