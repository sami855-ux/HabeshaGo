import { bookingService } from "../services/booking.service.js";

export const BookingController = {
  // Create booking
  async create(req, res) {
    try {
      const booking = await bookingService.createBooking(req.body);
      res.json(booking);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Get all bookings for a user
  async getUserBookings(req, res) {
    try {
      const bookings = await bookingService.getUserBookings(req.params.userId);
      res.json(bookings);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
