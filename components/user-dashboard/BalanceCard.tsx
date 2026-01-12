"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export default function BalanceCard() {
  const { wallet, loading } = useSelector((state: RootState) => state.wallet);

  /* -------------------- */
  /* LOADING STATE */
  /* -------------------- */
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent className="text-lg text-muted-foreground">
          Loading wallet...
        </CardContent>
      </Card>
    );
  }

  /* -------------------- */
  /* WALLET NOT CREATED */
  /* -------------------- */
  if (!wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent className="text-red-500">Wallet not found</CardContent>
      </Card>
    );
  }

  /* -------------------- */
  /* WALLET EXISTS */
  /* -------------------- */
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Balance</CardTitle>
      </CardHeader>
      <CardContent className="text-3xl font-bold">
        {wallet.currency} {wallet.balance.toFixed(2)}
      </CardContent>
    </Card>
  );
}
