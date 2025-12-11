import { User } from "@/types/user"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UserState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

const initialState: UserState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
}

//  Load user + token from AsyncStorage on app startup
export const loadUserFromStorage = createAsyncThunk(
  "user/loadFromStorage",
  async () => {
    const storedUser = await AsyncStorage.getItem("user")
    const storedToken = await AsyncStorage.getItem("token")

    if (!storedUser || !storedToken) {
      return { user: null, token: null }
    }

    return {
      user: JSON.parse(storedUser) as User,
      token: storedToken,
    }
  }
)

//  Save token + user to AsyncStorage when logging in
export const saveUserToStorage = createAsyncThunk(
  "user/saveToStorage",
  async (payload: { user: User; token: string }) => {
    await AsyncStorage.setItem("user", JSON.stringify(payload.user))
    await AsyncStorage.setItem("token", payload.token)

    return payload
  }
)

//    Clear everything on logout
export const clearStorage = createAsyncThunk("user/clearStorage", async () => {
  await AsyncStorage.removeItem("user")
  await AsyncStorage.removeItem("token")
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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },

  extraReducers: (builder) => {
    /* Load from storage */
    builder.addCase(loadUserFromStorage.fulfilled, (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = !!token
    })

    /* Save to storage */
    builder.addCase(saveUserToStorage.fulfilled, (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    })

    /* Logout */
    builder.addCase(clearStorage.fulfilled, (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    })
  },
})

export const { updateUser, setLoading } = userSlice.actions
export default userSlice.reducer
