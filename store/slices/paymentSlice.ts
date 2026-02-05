import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
// import { createWalletPayment } from "@/services/payment.api";

export const processWalletPayment = createAsyncThunk(
  "payment/processWalletPayment",
  async (
    payload: { busId: number; seatNumbers: number[]; amount: number },
    { rejectWithValue },
  ) => {
    try {
      // const res = await createWalletPayment(payload);
      // Save booking/payment info temporarily
      localStorage.setItem("tempBooking", JSON.stringify(res))
      return res
    } catch (err: any) {
      console.error("❌ Payment Error:", err.response?.data || err.message)
      return rejectWithValue(err.response?.data?.error || "Payment failed")
    }
  },
)

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    loading: false,
    success: false,
    error: null as string | null,
  },
  reducers: {
    resetPayment: (state) => {
      state.loading = false
      state.success = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processWalletPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(processWalletPayment.fulfilled, (state) => {
        state.loading = false
        state.success = true
      })
      .addCase(processWalletPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { resetPayment } = paymentSlice.actions
export default paymentSlice.reducer
