import { getMe } from "@/services/auth.user.api"
import { User } from "@/types/user"
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"

interface UserState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error?: string
}

const initialState: UserState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true,
  error: undefined,
}

export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // 1️. Load cached user
      const cachedUser = localStorage.getItem("habeshagoUser")
      if (cachedUser) {
        // dispatch immediately for instant UI
        dispatch(setUser({ user: JSON.parse(cachedUser) }))
      }

      // 2. Fetch from backend
      const response = await getMe()
      const backendUser = response.user

      // 3. Compare and update if different
      if (!cachedUser || JSON.stringify(backendUser) !== cachedUser) {
        dispatch(setUser({ user: backendUser }))
        localStorage.setItem("habeshagoUser", JSON.stringify(backendUser))
      }

      return backendUser
    } catch (err: any) {
      // Clear localStorage if fetch fails
      localStorage.removeItem("habeshagoUser")
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
        },
      )
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
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
} = userSlice.actions

export default userSlice.reducer
