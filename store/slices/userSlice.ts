import { axiosInstance } from "@/service/axiosInstance"
import { User } from "@/types/user"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import * as SecureStore from "expo-secure-store"

interface UserState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  loading: boolean
  isBootstrapping: boolean
}

const initialState: UserState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  isBootstrapping: true,
}

export const logout = createAsyncThunk(
  "user/logout",
  async (_, { dispatch }) => {
    // Remove refresh token from secure storage
    await SecureStore.deleteItemAsync("refreshToken")

    // Optional: tell backend to invalidate session
    // await axios.post("/app/auth/logout")

    dispatch(clearUser())
  }
)

export const loadUserFromStorage = createAsyncThunk(
  "user/loadFromStorage",
  async () => {
    const user = await SecureStore.getItemAsync("user")

    return {
      user: user ? JSON.parse(user) : null,
    }
  }
)
export const saveUserToStorage = createAsyncThunk(
  "user/saveToStorage",
  async ({ user }: { user: User }) => {
    await SecureStore.setItemAsync("user", JSON.stringify(user))

    return { user }
  }
)

export const clearStorage = createAsyncThunk("user/clearStorage", async () => {
  await SecureStore.deleteItemAsync("user")
  await SecureStore.deleteItemAsync("accessToken")
  await SecureStore.deleteItemAsync("refreshToken")
})

export const restoreSession = createAsyncThunk(
  "user/restoreSession",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken")

      if (!refreshToken) {
        dispatch(clearUser())
        return { success: false }
      }

      const res = await axiosInstance.post("/app/auth/refresh", {
        refreshToken,
      })

      dispatch(setAccessToken({ accessToken: res.data.accessToken }))

      return { success: true }
    } catch (err) {
      await SecureStore.deleteItemAsync("refreshToken")
      dispatch(clearUser())
      return { success: false }
    }
  }
)

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: UserState["user"] }>) => {
      state.user = action.payload.user
      state.isAuthenticated = true
    },
    updateUser: (state, action: PayloadAction<Partial<UserState["user"]>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },

    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
      state.isAuthenticated = true
    },

    clearUser: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.isAuthenticated = true
      })

      .addCase(saveUserToStorage.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.isAuthenticated = true
      })

      .addCase(clearStorage.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
      })
      .addCase(restoreSession.fulfilled, (state) => {
        state.isAuthenticated = true
        state.isBootstrapping = false
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isAuthenticated = false
        state.isBootstrapping = false
      })
  },
})

export const { setUser, updateUser, setAccessToken, clearUser } =
  userSlice.actions
export default userSlice.reducer
