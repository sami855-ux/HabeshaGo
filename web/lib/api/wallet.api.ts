import { http } from "@/lib/http";

export interface Wallet {
  id: string;
  balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  description: string;
  createdAt: string;
}

export const walletApi = {
  getWallet(userId: string) {
    return http<Wallet>(`/wallet/${userId}`);
  },

  getTransactions(userId: string) {
    return http<WalletTransaction[]>(`/wallet/${userId}/transactions`);
  },
};
