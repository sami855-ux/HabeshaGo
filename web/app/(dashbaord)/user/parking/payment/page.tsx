"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PaymentPIN } from "@/components/user-parking/PaymentPIN";
import { useAppDispatch } from "@/store/store";
import { paySession } from "@/store/slices/parkingUserSlice";

export default function PaymentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("sessionId");
  const cost = searchParams.get("cost");

  if (!sessionId || !cost) {
    return (
      <div className="p-4 text-red-500 dark:text-red-400 bg-gray-50 dark:bg-zinc-950 min-h-screen">
        Invalid payment link
      </div>
    );
  }

  const handlePayment = async (pin: string) => {
    try {
      const res = await dispatch(paySession({ sessionId, pin })).unwrap();

      const txnId =
        res?.walletTx?.id ||
        res?.txnId ||
        "TXN-" + Math.random().toString(36).slice(2, 10);

      router.push(
        `/user/parking/payment/success?sessionId=${sessionId}&cost=${cost}&txnId=${txnId}`,
      );
    } catch (err: any) {
      throw new Error(err?.message || "Payment failed");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-950 min-h-screen">
      <PaymentPIN
        amount={parseFloat(cost)}
        onBack={() => router.back()}
        onPaymentSuccess={handlePayment}
      />
    </div>
  );
}
