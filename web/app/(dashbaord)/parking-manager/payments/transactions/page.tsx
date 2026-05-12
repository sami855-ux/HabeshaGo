"use client"

import { useState } from "react";
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Search,
} from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { cn } from "../../../../../lib/utils";

const mockTransactions = [
  {
    id: "TXN-001",
    sessionId: "SES-100",
    userName: "John Doe",
    amount: 27.5,
    paymentMethod: "Credit Card",
    status: "completed",
    timestamp: "2026-04-22T14:30:00",
  },
  {
    id: "TXN-002",
    sessionId: "SES-099",
    userName: "Jane Smith",
    amount: 152.0,
    paymentMethod: "Debit Card",
    status: "completed",
    timestamp: "2026-04-22T10:15:00",
  },
  {
    id: "TXN-003",
    sessionId: "SES-098",
    userName: "Mike Johnson",
    amount: 8.0,
    paymentMethod: "Mobile Payment",
    status: "pending",
    timestamp: "2026-04-22T09:00:00",
  },
  {
    id: "TXN-004",
    sessionId: "SES-097",
    userName: "Sarah Williams",
    amount: 45.0,
    paymentMethod: "Credit Card",
    status: "failed",
    timestamp: "2026-04-21T18:45:00",
  },
];

export default function Transactions() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTransactions = transactions.filter((txn) => {
    if (statusFilter !== "all" && txn.status !== statusFilter) return false;
    if (
      searchTerm &&
      !txn.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !txn.userName.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "failed":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalAmount = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, txn) => sum + txn.amount, 0);
  const pendingAmount = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, txn) => sum + txn.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            View and manage all payment transactions
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <h3 className="text-2xl font-bold mt-1">
                ${totalAmount.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completed
              </p>
              <h3 className="text-2xl font-bold mt-1 text-green-600">
                {transactions.filter((t) => t.status === "completed").length}
              </h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <h3 className="text-2xl font-bold mt-1 text-yellow-600">
                ${pendingAmount.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
              <h3 className="text-2xl font-bold mt-1 text-red-600">
                {transactions.filter((t) => t.status === "failed").length}
              </h3>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Transaction ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Session ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  User
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Payment Method
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => (
                <tr
                  key={txn.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="py-3 px-4 text-sm font-medium">{txn.id}</td>
                  <td className="py-3 px-4 text-sm text-blue-600 dark:text-blue-400">
                    {txn.sessionId}
                  </td>
                  <td className="py-3 px-4 text-sm">{txn.userName}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-green-600">
                    ${txn.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3 text-gray-400" />
                      {txn.paymentMethod}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {formatDateTime(txn.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize",
                        getStatusColor(txn.status),
                      )}
                    >
                      {getStatusIcon(txn.status)}
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
