import { http } from "@/lib/http";

interface WalletPaymentPayload {
  userId: string;
  amount: number;
  referenceId: string; // booking ID
  module: "BUS";
}

interface PaymentResponse {
  status: "SUCCESS" | "FAILED";
  transactionId: string;
}

export const paymentApi = {
  payWithWallet(payload: WalletPaymentPayload) {
    return http<PaymentResponse>("/payments/wallet", {
      method: "POST",
      body: payload,
    });
  },
};
