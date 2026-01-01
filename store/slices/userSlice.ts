import { User } from "@/types/user"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import * as SecureStore from "expo-secure-store"

interface UserState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  loading: boolean
}

const initialState: UserState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
}

export const loadUserFromStorage = createAsyncThunk(
  "user/loadFromStorage",
  async () => {
    const user = await SecureStore.getItemAsync("user")
    const accessToken = await SecureStore.getItemAsync("accessToken")

    return {
      user: user ? JSON.parse(user) : null,
      accessToken,
    }
  }
)
export const saveUserToStorage = createAsyncThunk(
  "user/saveToStorage",
  async ({
    user,
    accessToken,
    refreshToken,
  }: {
    user: User
    accessToken: string
    refreshToken: string
  }) => {
    await SecureStore.setItemAsync("user", JSON.stringify(user))
    await SecureStore.setItemAsync("accessToken", accessToken)
    await SecureStore.setItemAsync("refreshToken", refreshToken)

    return { user, accessToken }
  }
)

export const clearStorage = createAsyncThunk("user/clearStorage", async () => {
  await SecureStore.deleteItemAsync("user")
  await SecureStore.deleteItemAsync("accessToken")
  await SecureStore.deleteItemAsync("refreshToken")
})

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },

    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
      state.isAuthenticated = true
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = !!action.payload.accessToken
      })

      .addCase(saveUserToStorage.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
      })

      .addCase(clearStorage.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
      })
  },
})

export const { updateUser, setAccessToken } = userSlice.actions
export default userSlice.reducer
