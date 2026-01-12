import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { walletApi } from "@/services/wallet.api";

/* =======================
   THUNKS
======================= */

export const fetchWallet = createAsyncThunk(
  "wallet/fetchWallet",
  async (_, { rejectWithValue }) => {
    try {
      return await walletApi.getWallet();
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch wallet");
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  "wallet/fetchTransactions",
  async (_, { rejectWithValue }) => {
    try {
      return await walletApi.transactions();
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch transactions");
    }
  }
);

export const depositWallet = createAsyncThunk(
  "wallet/deposit",
  async (amount: number, { dispatch, rejectWithValue }) => {
    try {
      await walletApi.deposit(amount);

      // 🔥 FORCE STATE SYNC AFTER DEPOSIT
      await dispatch(fetchWallet());
      await dispatch(fetchTransactions());
    } catch (err: any) {
      return rejectWithValue(err.message || "Deposit failed");
    }
  }
);

/* =======================
   SLICE
======================= */

interface WalletState {
  wallet: any | null;
  transactions: any[];
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  wallet: null,
  transactions: [],
  loading: false,
  error: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* ===== FETCH WALLET ===== */
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.wallet = action.payload;
        state.loading = false;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== FETCH TRANSACTIONS ===== */
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })

      /* ===== DEPOSIT ===== */
      .addCase(depositWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(depositWallet.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(depositWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default walletSlice.reducer;
