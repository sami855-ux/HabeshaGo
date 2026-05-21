import { getMe } from "@/services/auth.user.api"
import { User } from "@/types/user"
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"

interface UserState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error?: string
  isReady: boolean
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
  async (
    accessToken: string | undefined = undefined,
    { dispatch, rejectWithValue },
  ) => {
    try {
      // Load cached user for instant UI
      if (typeof window !== "undefined") {
        const cachedUser = localStorage.getItem("habeshagoUser")
        if (cachedUser) {
          dispatch(setUser({ user: JSON.parse(cachedUser) }))
        }
      }

      // Fetch from backend — pass token explicitly if provided
      const response = await getMe(accessToken)
      const backendUser = response.user

      if (typeof window !== "undefined") {
        const cachedUser = localStorage.getItem("habeshagoUser")
        if (!cachedUser || JSON.stringify(backendUser) !== cachedUser) {
          localStorage.setItem("habeshagoUser", JSON.stringify(backendUser))
        }
      }

      return backendUser
    } catch (err: any) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("habeshagoUser")
      }
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch user" },
      )
    }
  },
)

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: UserState["user"] }>) => {
      state.user = action.payload.user
      state.isAuthenticated = true
      state.loading = false
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
      state.isReady = false
    },
    markReady: (state) => {
      state.isReady = true
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setAccessToken: (state, action: PayloadAction<any>) => {
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
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
        state.isReady = true
      })
  },
})

export const {
  setUser,
  updateUser,
  clearUser,
  setLoading,
  setAccessToken,
  setError,
  markReady,
} = userSlice.actions

export default userSlice.reducer
