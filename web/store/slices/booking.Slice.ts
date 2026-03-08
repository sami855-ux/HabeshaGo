import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bookingService } from "@/services/booking.api";

interface BookingState {
  bookings: any[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  loading: false,
  error: null,
};

// Async thunk to create booking
export const createBookingThunk = createAsyncThunk(
  "booking/createBooking",
  async (
    data: {
      userId: string;
      busId: number;
      seatNumbers: number[];
      payNow?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await bookingService.createBooking(data);
      return res;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to create booking"
      );
    }
  }
);

// Async thunk to get user bookings
export const getUserBookingsThunk = createAsyncThunk(
  "booking/getUserBookings",
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await bookingService.getUserBookings(userId);
      return res;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch bookings"
      );
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingState(state) {
      state.bookings = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBookingThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBookingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
      })
      .addCase(createBookingThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get user bookings
      .addCase(getUserBookingsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBookingsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(getUserBookingsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
