import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  searchBuses,
  getSeatAvailability,
  getBusById,
} from "@/services/bus.api";


interface BusState {
  buses: any[];
  selectedBus: any | null;
  seats: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: BusState = {
  buses: [],
  selectedBus: null,
  seats: null,
  loading: false,
  error: null,
};


export const searchBusesThunk = createAsyncThunk(
  "bus/search",
  async (
    { start, end }: { start: string; end: string },
    { rejectWithValue }
  ) => {
    try {
      return await searchBuses(start, end);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Search failed");
    }
  }
);

export const getBusThunk = createAsyncThunk(
  "bus/getById",
  async (busId: number, { rejectWithValue }) => {
    try {
      return await getBusById(busId);
    } catch (err: any) {
      return rejectWithValue("Failed to load bus");
    }
  }
);

export const getSeatAvailabilityThunk = createAsyncThunk(
  "bus/seats",
  async (
    { busId, date }: { busId: number; date: string },
    { rejectWithValue }
  ) => {
    try {
      return await getSeatAvailability(busId, date);
    } catch (err: any) {
      return rejectWithValue("Failed to load seats");
    }
  }
);

const busSlice = createSlice({
  name: "bus",
  initialState,
  reducers: {
    selectBus(state, action) {
      state.selectedBus = action.payload;
      state.seats = null;
    },
    clearBusState(state) {
      state.buses = [];
      state.selectedBus = null;
      state.seats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBusesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBusesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.buses = action.payload;
      })
      .addCase(searchBusesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get bus
      .addCase(getBusThunk.fulfilled, (state, action) => {
        state.selectedBus = action.payload;
      })

      // Seat availability
      .addCase(getSeatAvailabilityThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSeatAvailabilityThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.seats = action.payload;
      })
      .addCase(getSeatAvailabilityThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectBus, clearBusState } = busSlice.actions;
export default busSlice.reducer;
