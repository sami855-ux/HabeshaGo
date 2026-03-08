import { axiosInstance } from "@/service/axiosInstance"
import {
  Bus,
  BusPosition,
  BusSearchCriteria,
  BusStatus,
  VehicleType,
} from "@/types/bus"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"

interface BusState {
  buses: Bus[]
  availableBuses: Bus[]
  selectedBus: Bus | null
  loading: boolean
  error: string | null
  searchCriteria: BusSearchCriteria
  busPositions: Record<number, BusPosition[]>
  filterOptions: {
    busTypes: VehicleType[]
    minCapacity: number
    maxCapacity: number
    statuses: BusStatus[]
  }
}

const initialState: BusState = {
  buses: [],
  availableBuses: [],
  selectedBus: null,
  loading: false,
  error: null,
  searchCriteria: {
    date: new Date().toISOString().split("T")[0],
    passengers: 1,
  },
  busPositions: {},
  filterOptions: {
    busTypes: [],
    minCapacity: 0,
    maxCapacity: 100,
    statuses: [BusStatus.ACTIVE],
  },
}

// Async Thunks
export const fetchBuses = createAsyncThunk(
  "bus/fetchBuses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/bus")
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch buses"
      )
    }
  }
)

export const searchAvailableBuses = createAsyncThunk(
  "bus/searchAvailableBuses",
  async (criteria: BusSearchCriteria, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/bus/search", criteria)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search buses"
      )
    }
  }
)

export const getBusDetails = createAsyncThunk(
  "bus/getBusDetails",
  async (busId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/buses/${busId}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bus details"
      )
    }
  }
)

export const updateBusStatus = createAsyncThunk(
  "bus/updateBusStatus",
  async (
    { busId, status }: { busId: number; status: BusStatus },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(`/api/buses/${busId}/status`, {
        status,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update bus status"
      )
    }
  }
)

export const fetchBusPositions = createAsyncThunk(
  "bus/fetchBusPositions",
  async (busId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/buses/${busId}/positions`)
      return { busId, positions: response.data }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bus positions"
      )
    }
  }
)

export const updateBusLocation = createAsyncThunk(
  "bus/updateBusLocation",
  async (
    {
      busId,
      position,
    }: { busId: number; position: Omit<BusPosition, "id" | "timestamp"> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        `/api/buses/${busId}/location`,
        position
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update bus location"
      )
    }
  }
)

const busSlice = createSlice({
  name: "bus",
  initialState,
  reducers: {
    setSearchCriteria: (
      state,
      action: PayloadAction<Partial<BusSearchCriteria>>
    ) => {
      state.searchCriteria = { ...state.searchCriteria, ...action.payload }
    },
    clearSearchCriteria: (state) => {
      state.searchCriteria = {
        date: new Date().toISOString().split("T")[0],
        passengers: 1,
      }
    },
    selectBus: (state, action: PayloadAction<Bus | null>) => {
      state.selectedBus = action.payload
    },
    clearSelectedBus: (state) => {
      state.selectedBus = null
    },
    setFilterOptions: (
      state,
      action: PayloadAction<Partial<BusState["filterOptions"]>>
    ) => {
      state.filterOptions = { ...state.filterOptions, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
    updateBusSeats: (
      state,
      action: PayloadAction<{ busId: number; availableSeats: number }>
    ) => {
      const bus = state.buses.find((b) => b.id === action.payload.busId)
      if (bus) {
        bus.capacity = action.payload.availableSeats
      }

      const availableBus = state.availableBuses.find(
        (b) => b.id === action.payload.busId
      )
      if (availableBus) {
        availableBus.capacity = action.payload.availableSeats
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch buses
      .addCase(fetchBuses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBuses.fulfilled, (state, action) => {
        state.loading = false
        state.buses = action.payload
      })
      .addCase(fetchBuses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Search available buses
      .addCase(searchAvailableBuses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchAvailableBuses.fulfilled, (state, action) => {
        state.loading = false
        state.availableBuses = action.payload
      })
      .addCase(searchAvailableBuses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Get bus details
      .addCase(getBusDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getBusDetails.fulfilled, (state, action) => {
        state.loading = false
        state.selectedBus = action.payload
      })
      .addCase(getBusDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update bus status
      .addCase(updateBusStatus.fulfilled, (state, action) => {
        const updatedBus = action.payload
        const index = state.buses.findIndex((b) => b.id === updatedBus.id)
        if (index !== -1) {
          state.buses[index] = updatedBus
        }

        const availIndex = state.availableBuses.findIndex(
          (b) => b.id === updatedBus.id
        )
        if (availIndex !== -1) {
          state.availableBuses[availIndex] = updatedBus
        }

        if (state.selectedBus?.id === updatedBus.id) {
          state.selectedBus = updatedBus
        }
      })

      // Fetch bus positions
      .addCase(fetchBusPositions.fulfilled, (state, action) => {
        state.busPositions[action.payload.busId] = action.payload.positions
      })

      // Update bus location
      .addCase(updateBusLocation.fulfilled, (state, action) => {
        const { busId, ...position } = action.payload
        if (!state.busPositions[busId]) {
          state.busPositions[busId] = []
        }
        state.busPositions[busId].push(position)
      })
  },
})

export const {
  setSearchCriteria,
  clearSearchCriteria,
  selectBus,
  clearSelectedBus,
  setFilterOptions,
  clearError,
  updateBusSeats,
} = busSlice.actions

export default busSlice.reducer
