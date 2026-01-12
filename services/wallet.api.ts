import { axiosInstance } from "@/services/axiosInstance";

export const walletApi = {
  getWallet: async () => {
    const { data } = await axiosInstance.get("/wallet/me");
    return data;
  },

  deposit: async (amount: number) => {
    const { data } = await axiosInstance.post("/wallet/deposit", { amount });
    return data;
  },

  transactions: async () => {
    const { data } = await axiosInstance.get("/wallet/transactions");
    return data;
  },
};
