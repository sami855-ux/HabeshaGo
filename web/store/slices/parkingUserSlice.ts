import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "@/services/axiosInstance";

/* ================= LOT ================= */

export const fetchParkingLots = createAsyncThunk(
  "admin/fetchLots",
  async () => {
    const res = await axiosInstance.get("/parking/lots");
     console.log("LOTS API:", res.data);
    return res.data.data;
  },
);

export const fetchNearbyLots = createAsyncThunk(
  "user/nearbyLots",
  async ({ lat, lng }) => {
    const res = await axiosInstance.get(
      `/parking/lots/nearby?lat=${lat}&lng=${lng}`,
    );
    return res.data.data;
  },
);

/* ================= SLOT ================= */

export const fetchSlotsByLot = createAsyncThunk(
  "admin/fetchSlots",
  async (lotId) => {
    const res = await axiosInstance.get(`/parking/lots/${lotId}/slots`);
    return res.data.data;
  },
);

export const fetchAvailableSlots = createAsyncThunk(
  "user/availableSlots",
  async (lotId) => {
    const res = await axiosInstance.get(
      `/parking/lots/${lotId}/slots/available`,
    );
    return res.data.data;
  },
);

/* ================= RESERVATION ================= */

export const createReservation = createAsyncThunk(
  "user/createReservation",
  async (data) => {
    const res = await axiosInstance.post("/parking/reservations", data);
    return res.data.data;
  },
);

export const fetchMyReservations = createAsyncThunk(
  "user/myReservations",
  async () => {
    const res = await axiosInstance.get("/parking/reservations/me");
    return res.data.data;
  },
);

/* ================= SESSION ================= */

export const checkInReservation = createAsyncThunk(
  "user/checkIn",
  async (id) => {
    const res = await axiosInstance.post(
      `/parking/reservations/${id}/check-in`,
    );
    return res.data.data;
  },
);

export const checkOutReservation = createAsyncThunk(
  "user/checkOut",
  async (id) => {
    const res = await axiosInstance.post(
      `/parking/reservations/${id}/check-out`,
    );
    return res.data.data;
  },
);

export const fetchMySessions = createAsyncThunk("user/mySessions", async () => {
  const res = await axiosInstance.get("/parking/sessions/me");
  return res.data.data;
});

export const fetchSessionCost = createAsyncThunk(
  "user/sessionCost",
  async (sessionId) => {
    const res = await axiosInstance.get(`/parking/sessions/${sessionId}/cost`);
    return res.data.data;
  },
);

/* ================= PAYMENT ================= */

export const paySession = createAsyncThunk(
  "user/pay",
  async ({ sessionId, pin }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/parking/sessions/pay", {
        sessionId,
        pin,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

/* ================= SLICE ================= */

const userSlice = createSlice({
  name: "parkingUser",
  initialState: {
    lots: [],
    slots: [],
    reservations: [],
    sessions: [],
    cost: null,
    loading: false,
    error: null,
  },
  reducers: {
    /* 🔥 REALTIME */


    reservationRealtime: (s, a) => {
      s.reservations.unshift(a.payload);
    },

    slotRealtime: (s, a) => {
      const i = s.slots.findIndex((x) => x.id === a.payload.id);
      if (i !== -1) s.slots[i] = a.payload;
    },

    sessionStartRealtime: (s, a) => {
      s.sessions.unshift(a.payload);
    },

    sessionEndRealtime: (s, a) => {
      const i = s.sessions.findIndex((x) => x.id === a.payload.id);
      if (i !== -1) s.sessions[i] = a.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchParkingLots.fulfilled, (s, a) => {
        s.lots = a.payload;
      })

      .addCase(fetchNearbyLots.fulfilled, (s, a) => {
        s.lots = a.payload;
      })
      
      .addCase(fetchSlotsByLot.fulfilled, (s, a) => {
        s.slots = a.payload;
      })

      .addCase(fetchAvailableSlots.fulfilled, (s, a) => {
        s.slots = a.payload;
      })

      .addCase(fetchMyReservations.fulfilled, (s, a) => {
        s.reservations = a.payload;
      })

      .addCase(createReservation.fulfilled, (s, a) => {
        s.reservations.unshift(a.payload);
      })

      .addCase(fetchMySessions.fulfilled, (s, a) => {
        s.sessions = a.payload;
      })

      .addCase(fetchSessionCost.fulfilled, (s, a) => {
        s.cost = a.payload;
      })

      .addCase(paySession.fulfilled, (s, a) => {
        const id = a.payload?.data?.walletTx?.metadata?.sessionId;

        const i = s.sessions.findIndex((x) => x.id === id);
        if (i !== -1) s.sessions[i].status = "PAID";
      })

      .addMatcher(
        (a) => a.type.endsWith("/pending"),
        (s) => {
          s.loading = true;
        },
      )
      .addMatcher(
        (a) => a.type.endsWith("/fulfilled"),
        (s) => {
          s.loading = false;
        },
      )
      .addMatcher(
        (a) => a.type.endsWith("/rejected"),
        (s, a) => {
          s.loading = false;
          s.error = a.payload || a.error.message;
        },
      );
  },
});

export const {
  reservationRealtime,
  slotRealtime,
  sessionStartRealtime,
  sessionEndRealtime,
} = userSlice.actions;

export default userSlice.reducer;
