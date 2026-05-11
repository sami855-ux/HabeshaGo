import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "@/services/axiosInstance";

/* ================= LOT ================= */

export const createParkingLot = createAsyncThunk(
  "admin/createLot",
  async (data) => {
    const res = await axiosInstance.post("/parking/lots", data);
    return res.data.data;
  },
);

export const fetchParkingLots = createAsyncThunk(
  "admin/fetchLots",
  async () => {
    const res = await axiosInstance.get("/parking/lots");
    return res.data.data;
  },
);

export const updateParkingLot = createAsyncThunk(
  "admin/updateLot",
  async ({ id, data }) => {
    const res = await axiosInstance.patch(`/parking/lots/${id}`, data);
    return res.data.data;
  },
);

export const deleteParkingLot = createAsyncThunk(
  "admin/deleteLot",
  async (id) => {
    await axiosInstance.delete(`/parking/lots/${id}`);
    return id;
  },
);

/* ================= SLOT ================= */

export const createSlots = createAsyncThunk(
  "admin/createSlots",
  async ({ lotId, slots }) => {
    const res = await axiosInstance.post(`/parking/lots/${lotId}/slots`, slots);
    return res.data.data;
  },
);

export const fetchSlotsByLot = createAsyncThunk(
  "admin/fetchSlots",
  async (lotId) => {
    const res = await axiosInstance.get(`/parking/lots/${lotId}/slots`);
    return res.data.data;
  },
);

export const updateSlotStatus = createAsyncThunk(
  "admin/updateSlotStatus",
  async ({ slotId, status }) => {
    const res = await axiosInstance.patch(`/parking/slots/${slotId}/status`, {
      status,
    });
    return res.data.data;
  },
);

export const deleteSlot = createAsyncThunk(
  "admin/deleteSlot",
  async (slotId) => {
    await axiosInstance.delete(`/parking/slots/${slotId}`);
    return slotId;
  },
);

export const fetchLotStats = createAsyncThunk(
  "admin/lotStats",
  async (lotId: string) => {
    const res = await axiosInstance.get(`/parking/lots/${lotId}/stats`);
    return res.data.data;
  },
);

/* ================= RESERVATIONS (🔥 NEW) ================= */

export const fetchAllReservations = createAsyncThunk(
  "admin/fetchReservations",
  async () => {
    const res = await axiosInstance.get("/parking/reservations");
    return res.data.data;
  },
);

export const cancelReservation = createAsyncThunk(
  "admin/cancelReservation",
  async (id) => {
    const res = await axiosInstance.patch(`/parking/reservations/${id}/cancel`);
    return res.data.data;
  },
);

export const markNoShow = createAsyncThunk("admin/noShow", async (id) => {
  const res = await axiosInstance.patch(`/parking/reservations/${id}/no-show`);
  return res.data.data;
});

export const checkInReservation = createAsyncThunk(
  "admin/checkInReservation",
  async (id) => {
    const res = await axiosInstance.post(
      `/parking/reservations/${id}/check-in`,
    );
    return res.data.data;
  },
);

export const checkOutReservation = createAsyncThunk(
  "admin/checkOutReservation",
  async (id) => {
    const res = await axiosInstance.post(
      `/parking/reservations/${id}/check-out`,
    );
    return res.data.data;
  },
);

export const fetchActiveSessions = createAsyncThunk(
  "admin/fetchActiveSessions",
  async () => {
    const res = await axiosInstance.get("/parking/sessions/active");
    return res.data.data;
  },
);

export const endSession = createAsyncThunk(
  "admin/endSession",
  async (sessionId) => {
    const res = await axiosInstance.post(`/parking/sessions/${sessionId}/end`);
    return res.data.data;
  },
);

export const getSessionCost = createAsyncThunk(
  "admin/getSessionCost",
  async (sessionId) => {
    const res = await axiosInstance.get(`/parking/sessions/${sessionId}/cost`);
    return res.data.data;
  },
);

/* ================= ANALYTICS ================= */

export const fetchSessionStats = createAsyncThunk(
  "admin/sessionStats",
  async () => {
    const res = await axiosInstance.get("/parking/sessions/stats");
    return res.data.data;
  },
);

export const fetchAllSessions = createAsyncThunk(
  "admin/fetchAllSessions",
  async () => {
    const res = await axiosInstance.get("/parking/sessions/all");
    return res.data.data;
  },
);

export const fetchDailyReport = createAsyncThunk(
  "admin/dailyReport",
  async (date) => {
    const res = await axiosInstance.get(`/parking/reports/daily?date=${date}`);

    return res.data.data;
  },
);

export const fetchPeakHours = createAsyncThunk("admin/peakHours", async () => {
  const res = await axiosInstance.get("/parking/reports/peak-hours");
  return res.data.data;
});

/* ================= SLICE ================= */

const adminSlice = createSlice({
  name: "parking",
  initialState: {
    lots: [],
    slots: [],
    reservations: [],
    sessions: [],
    stats: null,
    lotStats: null,
    peakHours: null,
    report: null,
    loading: false,
    error: null,
  },
  reducers: {
    updateSlotRealtime: (state, action) => {
      const i = state.slots.findIndex((s) => s.id === action.payload.id);
      if (i !== -1) state.slots[i] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      /* LOT */
      .addCase(fetchParkingLots.fulfilled, (s, a) => {
        s.lots = a.payload;
      })
      .addCase(createParkingLot.fulfilled, (s, a) => {
        s.lots.unshift(a.payload);
      })
      .addCase(updateParkingLot.fulfilled, (s, a) => {
        const i = s.lots.findIndex((l) => l.id === a.payload.id);
        if (i !== -1) s.lots[i] = a.payload;
      })
      .addCase(deleteParkingLot.fulfilled, (s, a) => {
        s.lots = s.lots.filter((l) => l.id !== a.payload);
      })

      /* SLOT */
      .addCase(fetchSlotsByLot.fulfilled, (s, a) => {
        s.slots = a.payload;
      })
      .addCase(updateSlotStatus.fulfilled, (s, a) => {
        const i = s.slots.findIndex((x) => x.id === a.payload.id);
        if (i !== -1) s.slots[i] = a.payload;
      })
      .addCase(deleteSlot.fulfilled, (s, a) => {
        s.slots = s.slots.filter((x) => x.id !== a.payload);
      })

      /* RESERVATIONS 🔥 */
      .addCase(fetchAllReservations.fulfilled, (s, a) => {
        s.reservations = a.payload;
      })
      .addCase(cancelReservation.fulfilled, (s, a) => {
        const i = s.reservations.findIndex((r) => r.id === a.payload.id);
        if (i !== -1) s.reservations[i] = a.payload;
      })
      .addCase(markNoShow.fulfilled, (s, a) => {
        const i = s.reservations.findIndex((r) => r.id === a.payload.id);
        if (i !== -1) s.reservations[i] = a.payload;
      })
      .addCase(fetchActiveSessions.fulfilled, (s, a) => {
        s.sessions = a.payload;
      })
      .addCase(fetchAllSessions.fulfilled, (s, a) => {
        s.sessions = a.payload;
      })

      .addCase(endSession.fulfilled, (s, a) => {
        const i = s.sessions.findIndex((x) => x.id === a.payload.id);
        if (i !== -1) s.sessions[i] = a.payload;
      })
      /* ANALYTICS */
      .addCase(fetchSessionStats.fulfilled, (s, a) => {
        s.stats = a.payload;
      })
      .addCase(fetchDailyReport.fulfilled, (s, a) => {
        s.report = a.payload;
      })
      .addCase(fetchPeakHours.fulfilled, (s, a) => {
        s.peakHours = a.payload;
      })
      .addCase(fetchLotStats.fulfilled, (s, a) => {
        s.lotStats = a.payload;
      })

      /* GLOBAL */
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
          s.error = a.error.message;
        },
      );
  },
});

export const { updateSlotRealtime } = adminSlice.actions;
export default adminSlice.reducer;
