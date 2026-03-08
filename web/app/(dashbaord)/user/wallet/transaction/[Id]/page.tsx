"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Repeat,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wallet,
  User,
  Calendar,
  Hash,
  FileText,
  Code,
  ArrowLeft,
  Printer,
} from "lucide-react"

// Mock transaction data
const MOCK_TRANSACTIONS = [
  {
    id: 31,
    walletId: 1001,
    recipientWalletId: null,
    amount: "500.00",
    type: "CREDIT",
    status: "COMPLETED",
    balanceAfter: "2500.00",
    reference: "REF_ABC123XYZ",
    description: "Salary deposit for March",
    metadata: {
      department: "Engineering",
      approvedBy: "John Manager",
      batchId: "BATCH_001",
    },
    createdAt: "2024-03-15T10:30:00Z",
    wallet: {
      id: 1001,
      user: {
        name: "Alice Johnson",
        email: "alice@example.com",
      },
    },
    recipientWallet: null,
  },
  {
    id: 2,
    walletId: 1001,
    recipientWalletId: 1002,
    amount: "150.00",
    type: "TRANSFER",
    status: "COMPLETED",
    balanceAfter: "2350.00",
    reference: "REF_DEF456UVW",
    description: "Payment for dinner",
    metadata: {
      note: "Thanks for dinner!",
      category: "Food",
    },
    createdAt: "2024-03-14T19:45:00Z",
    wallet: {
      id: 1001,
      user: {
        name: "Alice Johnson",
        email: "alice@example.com",
      },
    },
    recipientWallet: {
      id: 1002,
      user: {
        name: "Bob Smith",
        email: "bob@example.com",
      },
    },
  },
  {
    id: 3,
    walletId: 1001,
    recipientWalletId: null,
    amount: "75.50",
    type: "DEBIT",
    status: "PENDING",
    balanceAfter: "2274.50",
    reference: "REF_GHI789RST",
    description: "Online purchase - Amazon",
    metadata: {
      merchant: "Amazon.com",
      items: ["Book", "Headphones"],
      paymentMethod: "Visa ending in 4242",
    },
    createdAt: "2024-03-14T14:20:00Z",
    wallet: {
      id: 1001,
      user: {
        name: "Alice Johnson",
        email: "alice@example.com",
      },
    },
    recipientWallet: null,
  },
  {
    id: 4,
    walletId: 1001,
    recipientWalletId: null,
    amount: "1000.00",
    type: "DEBIT",
    status: "FAILED",
    balanceAfter: "2350.00",
    reference: "REF_JKL012MNO",
    description: "Wire transfer to savings",
    metadata: {
      error: "Insufficient funds",
      attemptedAt: "2024-03-13T09:15:00Z",
      retryCount: 2,
    },
    createdAt: "2024-03-13T09:15:00Z",
    wallet: {
      id: 1001,
      user: {
        name: "Alice Johnson",
        email: "alice@example.com",
      },
    },
    recipientWallet: null,
  },
]

// Helper functions
function getStatusIcon(status: string) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    case "PENDING":
      return <Clock className="h-5 w-5 text-yellow-500" />
    case "FAILED":
      return <XCircle className="h-5 w-5 text-red-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-200"
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "FAILED":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "CREDIT":
      return <ArrowDownCircle className="h-6 w-6 text-green-500" />
    case "DEBIT":
      return <ArrowUpCircle className="h-6 w-6 text-red-500" />
    case "TRANSFER":
      return <Repeat className="h-6 w-6 text-blue-500" />
    default:
      return null
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case "CREDIT":
      return "text-green-600 bg-green-50"
    case "DEBIT":
      return "text-red-600 bg-red-50"
    case "TRANSFER":
      return "text-blue-600 bg-blue-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

function formatCurrency(amount: string | number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount))
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(date)
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

// Loading component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Not found component
function NotFound() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-xl  border border-gray-200 p-8">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Transaction Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The transaction you're looking for doesn't exist or has been
            removed.
          </p>
          <Link
            href="/user/wallet"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function TransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  //TransactionId
  const transactionId = Number(params.Id as string)

  useEffect(() => {
    // Simulate API call
    const fetchTransaction = async () => {
      try {
        setLoading(true)
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        const foundTransaction = MOCK_TRANSACTIONS.find(
          (t) => t.id == transactionId,
        )

        if (foundTransaction) {
          setTransaction(foundTransaction)
          setError(null)
        } else {
          setError("Transaction not found")
        }
      } catch (err) {
        setError("Failed to load transaction")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTransaction()
  }, [transactionId])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error || !transaction) {
    return <NotFound />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <span
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Transactions
          </span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Transaction Details
              </h1>
              <p className="text-gray-500 mt-1">
                View detailed information about this transaction
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>

        {/* Main Transaction Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Status Bar */}
          <div
            className={`px-6 py-3 border-b ${getStatusColor(transaction.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(transaction.status)}
                <span className="font-medium">{transaction.status}</span>
              </div>
              <span className="text-sm opacity-75">
                {formatRelativeTime(transaction.createdAt)}
              </span>
            </div>
          </div>

          {/* Amount Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-full ${getTypeColor(transaction.type)}`}
                >
                  {getTypeIcon(transaction.type)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction Type</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {transaction.type.charAt(0) +
                      transaction.type.slice(1).toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Amount</p>
                <p
                  className={`text-3xl font-bold ${
                    transaction.type === "CREDIT"
                      ? "text-green-600"
                      : transaction.type === "DEBIT"
                        ? "text-red-600"
                        : "text-blue-600"
                  }`}
                >
                  {transaction.type === "DEBIT"
                    ? "−"
                    : transaction.type === "CREDIT"
                      ? "+"
                      : "↔︎ "}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Details Grid */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Wallet className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Sender Wallet
                    </p>
                    <p className="text-base text-gray-900">
                      Wallet #{transaction.walletId}
                    </p>
                    {transaction.wallet?.user && (
                      <p className="text-sm text-gray-600">
                        {transaction.wallet.user.name} ·{" "}
                        {transaction.wallet.user.email}
                      </p>
                    )}
                  </div>
                </div>

                {transaction.recipientWallet && (
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Recipient Wallet
                      </p>
                      <p className="text-base text-gray-900">
                        Wallet #{transaction.recipientWalletId}
                      </p>
                      {transaction.recipientWallet?.user && (
                        <p className="text-sm text-gray-600">
                          {transaction.recipientWallet.user.name} ·{" "}
                          {transaction.recipientWallet.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Created At
                    </p>
                    <p className="text-base text-gray-900">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Reference
                    </p>
                    <p className="text-base font-mono text-gray-900 break-all bg-gray-50 px-2 py-1 rounded">
                      {transaction.reference}
                    </p>
                  </div>
                </div>

                {transaction.description && (
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Description
                      </p>
                      <p className="text-base text-gray-900">
                        {transaction.description}
                      </p>
                    </div>
                  </div>
                )}

                {transaction.balanceAfter && (
                  <div className="flex items-start space-x-3">
                    <Wallet className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Balance After
                      </p>
                      <p className="text-base text-gray-900">
                        {formatCurrency(transaction.balanceAfter)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Section */}
            {transaction.metadata &&
              Object.keys(transaction.metadata).length > 0 && (
                <>
                  <hr className="my-6 border-gray-200" />
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Code className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Additional Information
                      </h3>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(transaction.metadata).map(
                          ([key, value]) => (
                            <div key={key}>
                              <dt className="text-sm font-medium text-gray-500 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </dt>
                              <dd className="text-sm text-gray-900 mt-1">
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </dd>
                            </div>
                          ),
                        )}
                      </dl>
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
