import { paymentService } from "../services/payment.service.js";

export const PaymentController = {
  async create(req, res) {
    try {
      const payment = await paymentService.pay(req.body);
      res.json(payment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async verify(req, res) {
    try {
      const result = await paymentService.verifyExternalPayment(
        req.body.gatewayRef,
        req.body
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async refund(req, res) {
    try {
      const result = await paymentService.refundPayment(
        req.body.paymentId,
        req.body.refundToWallet
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
