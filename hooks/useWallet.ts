import { useQuery } from "@tanstack/react-query";
import { walletApi, Wallet, WalletTransaction } from "@/lib/api/wallet.api";

export function useWallet(userId: string) {
  return useQuery<Wallet>({
    queryKey: ["wallet", userId],
    queryFn: () => walletApi.getWallet(userId),
    staleTime: 1000 * 60, 
  });
}

export function useWalletTransactions(userId: string) {
  return useQuery<WalletTransaction[]>({
    queryKey: ["wallet-transactions", userId],
    queryFn: () => walletApi.getTransactions(userId),
    staleTime: 1000 * 30, // 30 seconds
  });
}
