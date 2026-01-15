import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface Route {
  id: number;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedTimeMin: number;
  midPoints: { name: string; lat: number; lng: number }[];
  isActive: boolean;
}

interface RouteState {
  routes: Route[];
  currentRoute: Route | null;
  loading: boolean;
  error: string | null;
}

const initialState: RouteState = {
  routes: [],
  currentRoute: null,
  loading: false,
  error: null,
};

// Fetch all routes
export const fetchRoutes = createAsyncThunk(
  "route/fetchRoutes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("http://localhost:5000/api/route");
      return res.data.data; // match your backend { data: [...routes], meta: ... }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch routes"
      );
    }
  }
);

// Fetch single route
export const fetchRouteById = createAsyncThunk(
  "route/fetchRouteById",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/route/${id}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch route"
      );
    }
  }
);

const routeSlice = createSlice({
  name: "route",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // All routes
      .addCase(fetchRoutes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Single route
      .addCase(fetchRouteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRouteById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoute = action.payload;
      })
      .addCase(fetchRouteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default routeSlice.reducer;
