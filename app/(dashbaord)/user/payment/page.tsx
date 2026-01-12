"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, PlusCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import axios from "axios";

export default function PaymentsPage({ userId }) {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [depositAmount, setDepositAmount] = useState("");

  // Fetch wallet and transactions
  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [balanceRes, transactionsRes] = await Promise.all([
        axios.get(`/api/wallet/${userId}`),
        axios.get(`/api/wallet/${userId}/transactions`),
      ]);
      setBalance(balanceRes.data);
      setTransactions(transactionsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load wallet data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [userId]);

  // Deposit money
  const handleDeposit = async () => {
    if (!depositAmount) return;
    setActionLoading(true);
    try {
      const res = await axios.post("/api/wallet/deposit", {
        userId,
        amount: Number(depositAmount),
      });
      setBalance(res.data);
      await fetchWalletData();
      setSuccessMessage(`Successfully deposited ${depositAmount} ETB`);
      setDepositAmount("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to deposit");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12 rounded-2xl">
      <div className="container mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Payments</h1>
        <p className="text-muted-foreground mb-6">
          Deposit money and track your wallet
        </p>

        {loading && (
          <p className="text-center text-muted-foreground">Loading...</p>
        )}
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}
        {successMessage && (
          <p className="text-center text-green-500 mb-4 flex items-center justify-center gap-2">
            <CheckCircle /> {successMessage}
          </p>
        )}

        {!loading && balance && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Wallet Balance</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                ETB {balance.balance}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle /> Deposit Money
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Amount"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
                <Button
                  onClick={handleDeposit}
                  disabled={actionLoading || !depositAmount}
                >
                  Deposit
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center">
                    No transactions yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((txn) => (
                      <Card key={txn.id} className="p-3">
                        <div className="flex justify-between">
                          <span>{txn.description}</span>
                          <span
                            className={`font-bold ${
                              txn.type === "credit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {txn.type === "credit" ? "+" : "-"} {txn.amount} ETB
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(txn.date).toLocaleString()}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
