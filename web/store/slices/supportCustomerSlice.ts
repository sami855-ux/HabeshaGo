"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { axiosInstance } from "@/services/axiosInstance";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: string;
  attachment?: {
    name: string;
    type: string;
    size: number;
    url?: string;
  };
}

interface SupportCustomerState {
  sessionId: string | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: SupportCustomerState = {
  sessionId: null,
  messages: [],
  loading: false,
  error: null,
};

/* ---------------- CREATE SESSION ---------------- */
export const createSession = createAsyncThunk(
  "supportCustomer/createSession",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/support-chat/session");
      return res.data.id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Session failed");
    }
  },
);

/* ---------------- FETCH MESSAGES ---------------- */
export const fetchMessages = createAsyncThunk(
  "supportCustomer/fetchMessages",
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/support-chat/messages/${sessionId}`,
      );

      return res.data.map((msg: any) => ({
        id: msg.id,
        text: msg.message,
        sender: msg.senderType === "AGENT" ? "agent" : "user",
        timestamp: msg.createdAt,
        attachment: msg.attachmentUrl
          ? {
              name: msg.attachmentName,
              type: msg.attachmentType,
              size: msg.attachmentSize,
              url: msg.attachmentUrl,
            }
          : undefined,
      }));
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load messages",
      );
    }
  },
);

/* ---------------- SEND MESSAGE ---------------- */
export const sendMessage = createAsyncThunk(
  "supportCustomer/sendMessage",
  async (
    {
      sessionId,
      text,
      attachment,
    }: { sessionId: string; text: string; attachment?: File },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("sessionId", sessionId);
      formData.append("senderType", "USER");
      formData.append("message", text);

      if (attachment) formData.append("file", attachment);

      const res = await axiosInstance.post("/support-chat/message", formData);

      const msg = res.data;

      return {
        id: msg.id,
        text: msg.message,
        sender: "user" as const,
        timestamp: msg.createdAt,
        attachment: msg.attachmentUrl
          ? {
              name: msg.attachmentName,
              type: msg.attachmentType,
              size: msg.attachmentSize,
              url: msg.attachmentUrl,
            }
          : undefined,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Message sending failed",
      );
    }
  },
);

/* ---------------- SLICE ---------------- */
export const supportCustomerSlice = createSlice({
  name: "supportCustomer",
  initialState,
  reducers: {
    /* ---------------- SOCKET RECEIVE ---------------- */
    receiveSocketMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      /* CREATE SESSION */
      .addCase(createSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionId = action.payload;
      })
      .addCase(createSession.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* FETCH MESSAGES */
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* SEND MESSAGE */
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action: any) => {
        state.error = action.payload;
      });
  },
});

export const { receiveSocketMessage } = supportCustomerSlice.actions;

export default supportCustomerSlice.reducer;
