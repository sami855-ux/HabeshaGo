import axios from "axios";

export const createWalletPayment = async ({
  amount,
  bookingId,
}: {
  amount: number;
  bookingId?: number;
}) => {
  console.log("📦 Payment Payload:", {
    amount,
    bookingId,
    method: "WALLET",
  });

  const res = await axios.post(
    "http://localhost:5000/api/payment",
    {
      amount,
      bookingId,
      method: "WALLET",
    },
    {
      withCredentials: true, // 🔐 required for auth cookie
    }
  );

  return res.data;
};
