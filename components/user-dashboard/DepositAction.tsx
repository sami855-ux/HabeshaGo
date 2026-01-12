"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { depositWallet } from "@/store/slices/walletSlice";
import { AppDispatch } from "@/store/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DepositAction() {
  const [amount, setAmount] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) return;

    await dispatch(depositWallet(Number(amount)));
    setAmount("");
  };

  return (
    <div className="my-4 space-y-2">
      <Input
        type="number"
        placeholder="Amount (ETB)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button onClick={handleDeposit} className="w-full">
        Deposit
      </Button>
    </div>
  );
}
