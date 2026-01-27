import { getUserWallet } from "@/services/wallet.api"
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { Wallet } from "@/types/user"

type WalletState = {
  wallet: Wallet | null
  loading: boolean
  error: string | null
  hasWallet: boolean
}

const initialState: WalletState = {
  wallet: null,
  loading: false,
  error: null,
  hasWallet: false, // explicit flag (very useful)
}

// 🔹 Fetch wallet after login
export const fetchUserWallet = createAsyncThunk(
  "wallet/fetchUserWallet",
  async (_, { rejectWithValue }) => {
    try {
      const wallet = await getUserWallet()
      return wallet // can be null
    } catch (error) {
      return rejectWithValue("Failed to fetch wallet")
    }
  },
)

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearWallet: (state) => {
      state.wallet = null
      state.loading = false
      state.error = null
      state.hasWallet = false
    },
    setWallet: (state, action) => {
      state.wallet = action.payload
      state.hasWallet = Boolean(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserWallet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserWallet.fulfilled, (state, action) => {
        state.loading = false
        state.wallet = action.payload
        state.hasWallet = Boolean(action.payload)
      })
      .addCase(fetchUserWallet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Something went wrong"
        state.wallet = null
        state.hasWallet = false
      })
  },
})

export const { clearWallet, setWallet } = walletSlice.actions
export default walletSlice.reducer
