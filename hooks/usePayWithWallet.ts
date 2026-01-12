import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "@/lib/api/payment.api";

export function usePayWithWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      userId: string;
      amount: number;
      referenceId: string;
    }) => paymentApi.payWithWallet({ ...payload, module: "BUS" }),
    onSuccess: (data, variables) => {
      // Invalidate wallet & transactions to refresh balance
      queryClient.invalidateQueries(["wallet", variables.userId]);
      queryClient.invalidateQueries(["wallet-transactions", variables.userId]);
    },
  });
}
