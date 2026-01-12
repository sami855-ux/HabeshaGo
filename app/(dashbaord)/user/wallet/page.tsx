"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWallet, fetchTransactions } from "@/store/slices/walletSlice";
import { RootState, AppDispatch } from "@/store/index";
import BalanceCard from "@/components/user-dashboard/BalanceCard";
import DepositAction from "@/components/user-dashboard/DepositAction";
import RecentTransactions from "@/components/user-dashboard/RecentTransactions";

export default function WalletPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { wallet, transactions, loading, error } = useSelector(
    (state: RootState) => state.wallet
  );

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions());
  }, [dispatch]);

  if (loading) return <p className="text-center mt-10">Loading wallet...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <BalanceCard wallet={wallet} />
      <DepositAction />
      <RecentTransactions transactions={transactions} />
    </div>
  );
}
