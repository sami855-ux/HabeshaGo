"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from "next/image"
import {
  Wallet,
  Shield,
  Lock,
  Banknote,
  ChevronLeft,
  Building,
} from "lucide-react"

import telebirrImg from "@/public/telebirr.png"
import cbeImg from "@/public/cbebirr.jpeg"
import chapaImg from "@/public/amole.jpeg"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { initiateWalletTopup } from "@/services/payment.api"
import { toast } from "sonner"
import { useAppSelector } from "@/store/store"

// ─── Types ────────────────────────────────────────────────────────────────────
export type PaymentMethod = "chapa" | "telebirr" | "cbe" | "bank"
export type EthiopianBank =
  | "cbe"
  | "awash"
  | "dashen"
  | "abyssinia"
  | "nib"
  | "zemen"
  | "wegagen"
  | "bunna"
  | "boa"
  | "abay"
  | "berhan"
  | "debub"

interface BankDetails {
  id: EthiopianBank
  name: string
  code: string
  logo: string
  swiftCode: string
  accountLength: number
  color: string
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const formSchema = z
  .object({
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 10, {
        message: "Minimum amount is 10 ETB",
      })
      .transform((val) => parseFloat(val)),
    paymentMethod: z.enum(["chapa", "telebirr", "cbe", "bank"]),
    selectedBank: z
      .enum([
        "cbe",
        "awash",
        "dashen",
        "abyssinia",
        "nib",
        "zemen",
        "wegagen",
        "bunna",
        "boa",
        "abay",
        "berhan",
        "debub",
      ])
      .optional(),
    accountNumber: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === "bank") {
        return (
          data.selectedBank &&
          data.accountNumber &&
          data.accountNumber.length >= 10
        )
      }
      return true
    },
    {
      message: "Bank selection and account number are required",
      path: ["selectedBank"],
    },
  )

// ─── Constants ────────────────────────────────────────────────────────────────
const presetAmounts = [50, 100, 200, 500, 1000, 5000]

const paymentMethods = [
  {
    id: "chapa",
    name: "Chapa",
    icon: chapaImg,
    description: "Digital Gateway",
    gateway: "chapa",
  },
  {
    id: "telebirr",
    name: "Telebirr",
    icon: telebirrImg,
    description: "Mobile Money",
    gateway: "telebirr",
  },
  {
    id: "cbe",
    name: "CBE Birr",
    icon: cbeImg,
    description: "Mobile Banking",
    gateway: "chapa",
  },
]

const ethiopianBanks: BankDetails[] = [
  {
    id: "cbe",
    name: "Commercial Bank of Ethiopia",
    code: "CBE",
    logo: "🏦",
    swiftCode: "CBETETAA",
    accountLength: 13,
    color: "bg-blue-100 border-blue-300 text-blue-700",
  },
  {
    id: "awash",
    name: "Awash Bank",
    code: "AWASH",
    logo: "🌊",
    swiftCode: "AWINETAA",
    accountLength: 13,
    color: "bg-green-100 border-green-300 text-green-700",
  },
  {
    id: "dashen",
    name: "Dashen Bank",
    code: "DASHEN",
    logo: "🏔️",
    swiftCode: "DASHETAA",
    accountLength: 13,
    color: "bg-purple-100 border-purple-300 text-purple-700",
  },
  {
    id: "abyssinia",
    name: "Bank of Abyssinia",
    code: "BOA",
    logo: "👑",
    swiftCode: "ABYSETAA",
    accountLength: 13,
    color: "bg-red-100 border-red-300 text-red-700",
  },
  {
    id: "nib",
    name: "Nib International Bank",
    code: "NIB",
    logo: "🌍",
    swiftCode: "NIBIETAA",
    accountLength: 13,
    color: "bg-orange-100 border-orange-300 text-orange-700",
  },
  {
    id: "zemen",
    name: "Zemen Bank",
    code: "ZEMEN",
    logo: "⏳",
    swiftCode: "ZEMEETAA",
    accountLength: 13,
    color: "bg-cyan-100 border-cyan-300 text-cyan-700",
  },
  {
    id: "wegagen",
    name: "Wegagen Bank",
    code: "WEGAGEN",
    logo: "🌱",
    swiftCode: "WEGAETAA",
    accountLength: 13,
    color: "bg-emerald-100 border-emerald-300 text-emerald-700",
  },
  {
    id: "bunna",
    name: "Bunna International Bank",
    code: "BUNNA",
    logo: "☕",
    swiftCode: "BUINETAA",
    accountLength: 13,
    color: "bg-amber-100 border-amber-300 text-amber-700",
  },
  {
    id: "abay",
    name: "Abay Bank",
    code: "ABAY",
    logo: "🌊",
    swiftCode: "ABAYETAA",
    accountLength: 13,
    color: "bg-sky-100 border-sky-300 text-sky-700",
  },
  {
    id: "berhan",
    name: "Berhan Bank",
    code: "BERHAN",
    logo: "💎",
    swiftCode: "BRHNETAA",
    accountLength: 13,
    color: "bg-indigo-100 border-indigo-300 text-indigo-700",
  },
  {
    id: "debub",
    name: "Debub Global Bank",
    code: "DEBUB",
    logo: "🌐",
    swiftCode: "DGBIETAA",
    accountLength: 13,
    color: "bg-lime-100 border-lime-300 text-lime-700",
  },
]

// ─── Skeleton Components ──────────────────────────────────────────────────────
function WalletBalanceSkeleton() {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
      <Skeleton className="h-8 w-40" />
    </div>
  )
}

function UserInfoSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-44" />
      </div>
    </div>
  )
}

function PaymentMethodsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="border-2 border-gray-100 rounded-xl p-5 flex flex-col items-center gap-3"
        >
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

function SummarySkeleton() {
  return (
    <Card className="border-gray-200 shadow-sm sticky top-8">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <Skeleton className="h-6 w-36" />
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <WalletBalanceSkeleton />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-7 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TopUpPage() {
  const router = useRouter()

  // ✅ Redux states
  const {
    wallet,
    loading: walletLoading,
    hasWallet,
  } = useAppSelector((state) => state.wallet)
  const { user, loading: userLoading } = useAppSelector((state) => state.user)

  // Combined loading state
  const isPageLoading = walletLoading || userLoading

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [selectedBankDetails, setSelectedBankDetails] =
    useState<BankDetails | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      paymentMethod: "chapa",
      selectedBank: undefined,
      accountNumber: "",
    },
  })

  const selectedPaymentMethod = form.watch("paymentMethod")
  const selectedBank = form.watch("selectedBank")

  useEffect(() => {
    if (selectedBank) {
      setSelectedBankDetails(
        ethiopianBanks.find((b) => b.id === selectedBank) || null,
      )
    } else {
      setSelectedBankDetails(null)
    }
  }, [selectedBank])

  const getTransactionFee = (amount: number) => {
    const fees: Record<string, number> = {
      chapa: 0.01,
      telebirr: 0.01,
      cbe: 0.01,
      bank: 0.005,
    }
    return amount * (fees[selectedPaymentMethod] || 0.01)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // ✅ Guard: wallet must exist
    if (!hasWallet || !wallet) {
      toast.error("Wallet not found", {
        description: "Please create a wallet before topping up.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const selectedMethod = paymentMethods.find(
        (m) => m.id === values.paymentMethod,
      )

      const res = await initiateWalletTopup({
        amount: values.amount,
        gateway: selectedMethod?.gateway || "chapa",
        type: "WALLET_TOPUP",
        flow: "WALLET_TOPUP",
      })

      if (res.success) {
        window.location.href = res.paymentUrl
        toast.success("Redirecting to payment...", {
          description: `Processing ETB ${values.amount.toLocaleString()} top-up`,
        })
      } else {
        toast.error("Failed to initiate payment", {
          description: res.message || "Please try again.",
        })
      }
    } catch (error) {
      toast.error("An error occurred", {
        description: "Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-row items-center mb-8 gap-4">
          <ChevronLeft
            size={30}
            className="text-gray-600 cursor-pointer"
            onClick={() => router.back()}
          />
          <div>
            {isPageLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-72" />
              </div>
            ) : (
              <>
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">
                  Top Up, {user?.name?.split(" ")[0] || "there"} 👋
                </h1>
                <p className="text-gray-600">
                  Add funds securely using your preferred payment method
                </p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Form ── */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-gray-200 shadow-none">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Select amount and payment method to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* ── User info row ── */}
                {isPageLoading ? (
                  <div className="mb-6">
                    <UserInfoSkeleton />
                  </div>
                ) : (
                  user && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {user.name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {user.email} • {user.phone}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="ml-auto bg-green-50 text-green-700 border-green-200"
                      >
                        Verified
                      </Badge>
                    </div>
                  )
                )}

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    {/* ── Preset amounts ── */}
                    <div className="space-y-4">
                      <FormLabel className="text-lg font-semibold">
                        Select Amount
                      </FormLabel>
                      {isPageLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-16 rounded-xl" />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {presetAmounts.map((amount) => (
                            <Button
                              key={amount}
                              type="button"
                              variant={
                                selectedAmount === amount
                                  ? "default"
                                  : "outline"
                              }
                              className={`h-16 flex-col gap-1 ${selectedAmount === amount ? "bg-blue-600 hover:bg-blue-700" : "hover:border-blue-300"}`}
                              onClick={() => {
                                setSelectedAmount(amount)
                                form.setValue("amount", amount.toString())
                              }}
                            >
                              <span className="text-lg font-semibold">
                                {amount >= 1000
                                  ? `${(amount / 1000).toFixed(0)}K`
                                  : amount}{" "}
                                ETB
                              </span>
                              <span className="text-xs opacity-80">
                                +{(amount * 0.01).toFixed(2)} fee
                              </span>
                            </Button>
                          ))}
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-500">
                              Or enter custom amount (min 10 ETB)
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                  ETB
                                </span>
                                <Input
                                  type="number"
                                  min="10"
                                  step="1"
                                  placeholder="Enter amount"
                                  className="pl-16 text-lg py-6 h-14"
                                  disabled={isPageLoading}
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e.target.value)
                                    setSelectedAmount(
                                      e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                    )
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* ── Payment methods ── */}
                    <div className="space-y-4">
                      <FormLabel className="text-lg font-semibold">
                        Payment Method
                      </FormLabel>
                      {isPageLoading ? (
                        <PaymentMethodsSkeleton />
                      ) : (
                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                                >
                                  {paymentMethods.map((method) => (
                                    <div key={method.id}>
                                      <RadioGroupItem
                                        value={method.id}
                                        id={method.id}
                                        className="peer sr-only"
                                      />
                                      <Label
                                        htmlFor={method.id}
                                        className={`flex flex-col items-center justify-center rounded-xl border-2 p-5 cursor-pointer transition-all h-full
                                          ${
                                            field.value === method.id
                                              ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
                                              : "border-gray-200 hover:border-gray-300 bg-white"
                                          }`}
                                      >
                                        <div className="w-12 h-12 mb-3 relative">
                                          <Image
                                            src={method.icon}
                                            alt={method.name}
                                            fill
                                            className="object-contain"
                                            sizes="48px"
                                          />
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                          {method.name}
                                        </span>
                                        <span className="text-sm text-gray-500 mt-1">
                                          {method.description}
                                        </span>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    {/* ── Bank selection ── */}
                    {selectedPaymentMethod === "bank" && !isPageLoading && (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        <Separator />
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Building className="h-5 w-5 text-purple-600" />{" "}
                          Select Your Bank
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="selectedBank"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Choose Bank</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-14 w-full">
                                      <SelectValue placeholder="Select a bank" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-h-96">
                                    {ethiopianBanks.map((bank) => (
                                      <SelectItem
                                        key={bank.id}
                                        value={bank.id}
                                        className="h-14"
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className="text-xl">
                                            {bank.logo}
                                          </span>
                                          <div>
                                            <div className="font-medium">
                                              {bank.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              SWIFT: {bank.swiftCode}
                                            </div>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter account number"
                                    className="h-12"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                                {selectedBankDetails && (
                                  <FormDescription>
                                    Enter your {selectedBankDetails.name}{" "}
                                    account number
                                  </FormDescription>
                                )}
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* ── No wallet warning ── */}
                    {!isPageLoading && !hasWallet && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                        ⚠️ You don't have a wallet yet. Please create one before
                        topping up.
                      </div>
                    )}

                    {/* ── Submit ── */}
                    <Button
                      type="submit"
                      className="w-full py-6 text-lg font-semibold shadow-lg"
                      disabled={
                        isSubmitting ||
                        !selectedAmount ||
                        isPageLoading ||
                        !hasWallet
                      }
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-3 h-5 w-5" />
                          Proceed to Payment
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Summary ── */}
          <div className="space-y-6">
            {isPageLoading ? (
              <SummarySkeleton />
            ) : (
              <Card className="border-gray-200 shadow-sm sticky top-8">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center justify-between">
                    <span>Order Summary</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-700"
                    >
                      Live
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* ✅ Real wallet balance from Redux */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 text-sm">
                        Current Balance
                      </span>
                      <Badge
                        variant="secondary"
                        className="font-normal text-xs"
                      >
                        {hasWallet ? "Active" : "No Wallet"}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {hasWallet
                        ? `${Number(wallet?.balance || 0).toLocaleString()} ETB`
                        : "— ETB"}
                    </div>
                    {hasWallet && (
                      <p className="text-xs text-gray-400 mt-1">
                        Points: {wallet?.points?.toLocaleString() || 0} pts
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">
                        Top-up Amount
                      </span>
                      <span className="font-bold text-blue-600">
                        {selectedAmount
                          ? `${selectedAmount.toLocaleString()} ETB`
                          : "0 ETB"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">
                        Transaction Fee
                      </span>
                      <span className="text-gray-700 text-sm">
                        {selectedAmount
                          ? `${getTransactionFee(selectedAmount).toFixed(2)} ETB`
                          : "0 ETB"}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-semibold">Total to Pay</span>
                      <span className="text-xl font-bold text-green-600">
                        {selectedAmount
                          ? `${(selectedAmount + getTransactionFee(selectedAmount)).toFixed(2)} ETB`
                          : "0 ETB"}
                      </span>
                    </div>

                    {/* ✅ New balance preview */}
                    {selectedAmount && hasWallet && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700 text-sm font-medium">
                            New Balance
                          </span>
                          <span className="text-green-700 font-bold">
                            {(
                              Number(wallet?.balance || 0) + selectedAmount
                            ).toLocaleString()}{" "}
                            ETB
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 text-sm">
                      Payment Details
                    </h4>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Method</span>
                      <Badge variant="outline" className="font-medium">
                        {
                          paymentMethods.find(
                            (m) => m.id === selectedPaymentMethod,
                          )?.name
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">
                        Processing Time
                      </span>
                      <span className="text-sm font-medium">Instant</span>
                    </div>
                    {/* ✅ Real user name */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Account</span>
                      <span className="text-sm font-medium">
                        {user?.name || "—"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Secure payment powered by</span>
            <span className="font-bold text-blue-700">CHAPA</span>
            <span>• Ethiopia's Trusted Payment Gateway</span>
          </div>
          <p className="text-xs text-gray-400">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
