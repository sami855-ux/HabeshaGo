import { axiosInstance } from "@/services/axiosInstance";

export const bookingService = {
  // Create a new booking
  createBooking: async (data: {
    userId: string;
    busId: number;
    seatNumbers: number[];
    payNow?: boolean;
  }) => {
    const res = await axiosInstance.post("/api/bookings", data);
    return res.data;
  },

  // Get bookings for a user
  getUserBookings: async (userId: string) => {
    const res = await axiosInstance.get(`/api/bookings/user/${userId}`);
    return res.data;
  },
};
