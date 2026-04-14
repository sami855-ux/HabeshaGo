"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { axiosInstance } from "@/services/axiosInstance";

/* ---------------- ATTACHMENT ---------------- */
interface Attachment {
  name: string;
  type: string;
  size: number;
  url?: string;
}

/* ---------------- MESSAGE ---------------- */
export interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: string;
  status?: "sending" | "sent" | "delivered" | "read";
  attachment?: Attachment;
}

/* ---------------- CUSTOMER ---------------- */
export interface Customer {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: number;
  online?: boolean;
  email?: string;
  phone?: string;
  joinDate?: string;
  totalTrips?: number;
  accountType?: string;
}

/* ---------------- STATE ---------------- */
interface SupportAgentState {
  customers: Customer[];
  messages: Record<string, Message[]>;
  selectedCustomerId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: SupportAgentState = {
  customers: [],
  messages: {},
  selectedCustomerId: null,
  loading: false,
  error: null,
};

/* ---------------- ASYNC THUNKS ---------------- */

// Fetch all active customer sessions
export const fetchCustomers = createAsyncThunk(
  "supportAgent/fetchCustomers",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/support-chat/sessions");
      return res.data.map((session: any) => ({
        id: session.id,
        name: session.user?.name || "Customer",
        avatar: session.user?.avatar || "",
        lastMessage: session.messages?.[0]?.message || "",
        timestamp: session.messages?.[0]?.createdAt || "",
        unread: session.unreadCount || 0,
        online: session.user?.online || false,
        email: session.user?.email,
        phone: session.user?.phone,
        joinDate: session.user?.joinDate,
        totalTrips: session.user?.totalTrips,
        accountType: session.user?.accountType,
      }));
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

// Fetch messages for selected session
export const fetchMessages = createAsyncThunk(
  "supportAgent/fetchMessages",
  async (sessionId: string, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/support-chat/messages/${sessionId}`,
      );
      return {
        sessionId,
        messages: res.data.map((msg: any) => ({
          id: msg.id,
          text: msg.message,
          sender: msg.senderType === "AGENT" ? "agent" : "user",
          timestamp: msg.createdAt,
          status: "sent",
          attachment: msg.attachmentUrl
            ? {
                name: msg.attachmentName,
                type: msg.attachmentType,
                size: msg.attachmentSize,
                url: msg.attachmentUrl,
              }
            : undefined,
        })),
      };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

// Send message as agent
export const sendMessage = createAsyncThunk(
  "supportAgent/sendMessage",
  async (
    {
      sessionId,
      text,
      attachment,
    }: { sessionId: string; text: string; attachment?: File },
    thunkAPI,
  ) => {
    try {
      const formData = new FormData();
      formData.append("sessionId", sessionId);
      formData.append("senderType", "AGENT");
      formData.append("message", text);

      if (attachment) formData.append("attachment", attachment);

      const res = await axiosInstance.post("/support-chat/message", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const msg = res.data;
      return {
        sessionId,
        message: {
          id: msg.id,
          text: msg.message,
          sender: "agent" as const,
          timestamp: msg.createdAt,
          status: "sent",
          attachment: msg.attachmentUrl
            ? {
                name: msg.attachmentName,
                type: msg.attachmentType,
                size: msg.attachmentSize,
                url: msg.attachmentUrl,
              }
            : undefined,
        },
      };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

/* ---------------- SLICE ---------------- */
export const supportAgentSlice = createSlice({
  name: "supportAgent",
  initialState,
  reducers: {
    selectCustomer: (state, action: PayloadAction<string>) => {
      state.selectedCustomerId = action.payload;
    },
    receiveSocketMessage: (
      state,
      action: PayloadAction<{ sessionId: string; message: Message }>,
    ) => {
      const { sessionId, message } = action.payload;
      if (!state.messages[sessionId]) state.messages[sessionId] = [];
      state.messages[sessionId].push(message);
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{
        sessionId: string;
        messageId: string;
        status: Message["status"];
      }>,
    ) => {
      const { sessionId, messageId, status } = action.payload;
      const msgs = state.messages[sessionId];
      if (!msgs) return;
      const msg = msgs.find((m) => m.id === messageId);
      if (msg) msg.status = status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
        state.loading = false;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { sessionId, messages } = action.payload;
        state.messages[sessionId] = messages;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { sessionId, message } = action.payload;
        if (!state.messages[sessionId]) state.messages[sessionId] = [];
        state.messages[sessionId].push(message);
      });
  },
});

export const { selectCustomer, receiveSocketMessage, updateMessageStatus } =
  supportAgentSlice.actions;
export default supportAgentSlice.reducer;
