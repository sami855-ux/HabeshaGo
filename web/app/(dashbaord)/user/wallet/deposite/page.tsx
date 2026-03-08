"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from "next/image"
import {
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  Shield,
  Lock,
  CheckCircle,
  User,
  Mail,
  Phone,
  Banknote,
  ChevronDown,
  Check,
  ChevronLeft,
} from "lucide-react"

// Import payment method images
import telebirrImg from "@/public/telebirr.png"
import mPesaImg from "@/public/mpesa.png"
import amoleImg from "@/public/amole.jpeg"
import cbeImg from "@/public/cbebirr.jpeg"

// UI Components
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { initiateWalletTopup } from "@/services/payment.api"
import { toast } from "sonner"

// Types
export type PaymentMethod =
  | "telebirr"
  | "m-pesa"
  | "bank"
  | "card"
  | "amole"
  | "cbe"
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

interface PaymentMethodOption {
  id: PaymentMethod
  name: string
  icon: any // Image component
  description: string
  color: string
  textColor: string
  showBankSelection: boolean
}

const formSchema = z
  .object({
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 10, {
        message: "Minimum amount is 10 ETB",
      })
      .transform((val) => parseFloat(val)),
    paymentMethod: z.enum([
      "telebirr",
      "m-pesa",
      "bank",
      "card",
      "amole",
      "cbe",
    ]),
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
      // If payment method is bank, require selectedBank and accountNumber
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
      message:
        "Bank selection and account number are required for bank transfer",
      path: ["selectedBank"],
    },
  )

const presetAmounts = [
  { amount: 50, label: "50 ETB" },
  { amount: 100, label: "100 ETB" },
  { amount: 200, label: "200 ETB" },
  { amount: 500, label: "500 ETB" },
  { amount: 1000, label: "1,000 ETB" },
  { amount: 5000, label: "5,000 ETB" },
]

// Payment methods with imported images
const paymentMethods: PaymentMethodOption[] = [
  {
    id: "telebirr",
    name: "Telebirr",
    icon: telebirrImg,
    description: "Mobile Money",
    color: "bg-blue-500 border-blue-200",
    textColor: "text-blue-700",
    showBankSelection: false,
  },
  {
    id: "m-pesa",
    name: "M-Pesa",
    icon: mPesaImg,
    description: "Mobile Money",
    color: "bg-green-500 border-green-200",
    textColor: "text-green-700",
    showBankSelection: false,
  },
  {
    id: "bank",
    name: "Bank Transfer",
    icon: "🏦",
    description: "Direct Transfer",
    color: "bg-purple-500 border-purple-200",
    textColor: "text-purple-700",
    showBankSelection: true,
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: "💳",
    description: "Visa, MasterCard",
    color: "bg-orange-500 border-orange-200",
    textColor: "text-orange-700",
    showBankSelection: false,
  },
  {
    id: "amole",
    name: "Amole",
    icon: amoleImg,
    description: "Digital Wallet",
    color: "bg-red-500 border-red-200",
    textColor: "text-red-700",
    showBankSelection: false,
  },
  {
    id: "cbe",
    name: "CBE Birr",
    icon: cbeImg,
    description: "Mobile Banking",
    color: "bg-yellow-500 border-yellow-200",
    textColor: "text-yellow-700",
    showBankSelection: false,
  },
]

// Ethiopian Banks Data
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
    id: "boa",
    name: "Berhan International Bank",
    code: "BERHAN",
    logo: "✨",
    swiftCode: "BEINETAA",
    accountLength: 13,
    color: "bg-violet-100 border-violet-300 text-violet-700",
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

// Mock user data
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  phone: "+251 912 345 678",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  walletBalance: 1250.5,
}

export default function TopUpPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [selectedBankDetails, setSelectedBankDetails] =
    useState<BankDetails | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      paymentMethod: "telebirr",
      selectedBank: undefined,
      accountNumber: "",
    },
  })

  const selectedPaymentMethod = form.watch("paymentMethod")
  const selectedBank = form.watch("selectedBank")

  // Update selected bank details when bank changes
  useEffect(() => {
    if (selectedBank) {
      const bank = ethiopianBanks.find((b) => b.id === selectedBank)
      setSelectedBankDetails(bank || null)
    } else {
      setSelectedBankDetails(null)
    }
  }, [selectedBank])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const res = await initiateWalletTopup({
        amount: values.amount,
        gateway: "chapa",
        type: "WALLET_TOPUP",
        flow: "WALLET_TOPUP",
      })

      if (res.success) {
        // Redirect to payment URL
        window.location.href = res.paymentUrl
        toast.success("Payment initiated successfully", {
          description: "You are being redirected to the payment gateway.",
        })
      } else {
        toast.error("Failed to initiate payment", {
          description: res.error || "Please try again later.",
        })
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("An error occurred while processing payment", {
        description: "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePresetAmountClick = (amount: number) => {
    setSelectedAmount(amount)
    form.setValue("amount", amount.toString())
  }

  const getTransactionFee = (amount: number) => {
    const method = form.getValues().paymentMethod
    const fees: Record<PaymentMethod, number> = {
      telebirr: 0.01,
      "m-pesa": 0.015,
      bank: 0.005,
      card: 0.025,
      amole: 0.02,
      cbe: 0.01,
    }
    return amount * (fees[method] || 0.02)
  }

  // Helper function to render payment method icon
  const renderPaymentIcon = (method: PaymentMethodOption) => {
    if (typeof method.icon === "string") {
      // For emoji icons (bank, card)
      return <div className="text-3xl mb-3">{method.icon}</div>
    } else {
      // For imported image icons
      return (
        <div className="w-12 h-12 mb-3 relative">
          <Image
            src={method.icon}
            alt={method.name}
            fill
            className="object-contain"
            sizes="(max-width: 48px) 100vw, 48px"
          />
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with User Info */}
        <div className="flex flex-row items-center mb-8 gap-4">
          <ChevronLeft
            size={30}
            className="h-6 w-6 text-gray-600 cursor-pointer"
            onClick={() => router.back()}
          />
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
              Top Up Your Wallet
            </h1>
            <p className="text-gray-600">
              Add funds securely using your preferred payment method
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Form */}
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
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    {/* Amount Selection */}
                    <div className="space-y-6">
                      <FormLabel className="text-lg font-semibold">
                        Select Amount
                      </FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {presetAmounts.map((item) => (
                          <Button
                            key={item.amount}
                            type="button"
                            variant={
                              selectedAmount === item.amount
                                ? "default"
                                : "outline"
                            }
                            className={`h-16 flex-col gap-1 ${selectedAmount === item.amount ? "bg-blue-600 hover:bg-blue-700" : "hover:border-blue-300"}`}
                            onClick={() => handlePresetAmountClick(item.amount)}
                          >
                            <span className="text-lg font-semibold">
                              {item.label}
                            </span>
                            <span className="text-xs opacity-80">
                              +{(item.amount * 0.015).toFixed(2)} ETB fee
                            </span>
                          </Button>
                        ))}
                      </div>

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
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                  ETB
                                </span>
                                <Input
                                  type="number"
                                  min="10"
                                  step="1"
                                  placeholder="Enter amount"
                                  className="pl-16 text-lg py-6 h-14 border-gray-300 focus:border-blue-500"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    field.onChange(value)
                                    setSelectedAmount(
                                      value ? Number(value) : null,
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

                    {/* Payment Method Selection */}
                    <div className="space-y-6">
                      <FormLabel className="text-lg font-semibold">
                        Payment Method
                      </FormLabel>
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
                                      className={`flex flex-col items-center justify-center rounded-xl border-2 p-5 cursor-pointer transition-all
                                        ${field.value === method.id ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"}
                                        h-full
                                      `}
                                    >
                                      {renderPaymentIcon(method)}
                                      <span className="font-semibold text-gray-900 text-center">
                                        {method.name}
                                      </span>
                                      <span className="text-sm text-gray-500 mt-1 text-center">
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
                    </div>

                    {/* Bank Selection (Only shown when Bank Transfer is selected) */}
                    {selectedPaymentMethod === "bank" && (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        <Separator />

                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Building className="h-5 w-5 text-purple-600" />
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
                                      <SelectTrigger className="h-24 w-full">
                                        <SelectValue placeholder="Select a bank" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-96 my-2">
                                      {ethiopianBanks.map((bank) => (
                                        <SelectItem
                                          key={bank.id}
                                          value={bank.id}
                                          className="h-14"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="text-xl">
                                              {bank.logo}
                                            </div>
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
                                  <FormLabel>
                                    Account Number
                                    {selectedBankDetails && (
                                      <span className="text-sm text-gray-500 ml-2">
                                        ({selectedBankDetails.accountLength}{" "}
                                        digits)
                                      </span>
                                    )}
                                  </FormLabel>
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

                          {/* Selected Bank Details */}
                          {selectedBankDetails && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="text-3xl">
                                    {selectedBankDetails.logo}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">
                                      {selectedBankDetails.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      SWIFT Code:{" "}
                                      {selectedBankDetails.swiftCode}
                                    </div>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={selectedBankDetails.color}
                                >
                                  {selectedBankDetails.code}
                                </Badge>
                              </div>
                              <div className="mt-3 text-sm text-gray-600">
                                <p>
                                  Ensure your account number is correct. Funds
                                  will be transferred directly to this account.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full py-6 text-lg font-semibold shadow-lg mt-6"
                      disabled={isLoading || !selectedAmount}
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-3 h-5 w-5" />
                          {selectedPaymentMethod === "bank"
                            ? "Proceed with Bank Transfer"
                            : "Proceed to Payment"}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="border-gray-200 shadow-sm sticky top-8">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center justify-between">
                  <span>Order Summary</span>
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-700"
                  >
                    Real-time
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Current Balance */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Current Balance</span>
                    <Badge variant="secondary" className="font-normal">
                      Live
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mockUser.walletBalance.toLocaleString()} ETB
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Top-up Amount</span>
                    <span className="text-xl font-bold text-blue-600">
                      {selectedAmount
                        ? `${selectedAmount.toLocaleString()} ETB`
                        : "0 ETB"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Transaction Fee</span>
                    <span className="font-medium text-gray-700">
                      {selectedAmount
                        ? `${getTransactionFee(selectedAmount).toFixed(2)} ETB`
                        : "0 ETB"}
                    </span>
                  </div>

                  {selectedPaymentMethod === "bank" && selectedBankDetails && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600">Bank Transfer Fee</span>
                      <span className="font-medium text-gray-700">
                        + 15.00 ETB
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold">Total to Pay</span>
                    <span className="text-2xl font-bold text-green-600">
                      {selectedAmount
                        ? `${(
                            selectedAmount +
                            getTransactionFee(selectedAmount) +
                            (selectedPaymentMethod === "bank" ? 15 : 0)
                          ).toFixed(2)} ETB`
                        : "0 ETB"}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Selected Method Details */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Payment Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Method</span>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const method = paymentMethods.find(
                            (m) => m.id === selectedPaymentMethod,
                          )
                          if (!method) return null

                          if (typeof method.icon === "string") {
                            return <div className="text-xl">{method.icon}</div>
                          } else {
                            return (
                              <div className="w-6 h-6 relative">
                                <Image
                                  src={method.icon}
                                  alt={method.name}
                                  fill
                                  className="object-contain"
                                  sizes="(max-width: 24px) 100vw, 24px"
                                />
                              </div>
                            )
                          }
                        })()}
                        <Badge variant="outline" className="font-medium">
                          {
                            paymentMethods.find(
                              (m) => m.id === selectedPaymentMethod,
                            )?.name
                          }
                        </Badge>
                      </div>
                    </div>

                    {selectedPaymentMethod === "bank" &&
                      selectedBankDetails && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Bank</span>
                            <div className="flex items-center gap-2">
                              <div className="text-xl">
                                {selectedBankDetails.logo}
                              </div>
                              <span className="font-medium">
                                {selectedBankDetails.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Transfer Time</span>
                            <span className="font-medium">
                              1-3 Business Days
                            </span>
                          </div>
                        </>
                      )}

                    {selectedPaymentMethod !== "bank" && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Processing Time</span>
                        <span className="font-medium">Instant</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank Transfer Note */}
                {selectedPaymentMethod === "bank" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Bank Transfer Note
                    </h5>
                    <p className="text-sm text-yellow-700">
                      Funds will be credited to your account within 1-3 business
                      days after payment confirmation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods Preview */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  Supported Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                        selectedPaymentMethod === method.id
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => form.setValue("paymentMethod", method.id)}
                    >
                      {renderPaymentIcon(method)}
                      <span className="font-medium text-sm text-center mt-2">
                        {method.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Secure payment powered by</span>
            <span className="font-bold text-blue-700">CHAPA</span>
            <span>• Ethiopia's Trusted Payment Gateway</span>
          </div>

          <p className="text-xs text-gray-400">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
            All transactions are secure and encrypted.
          </p>
        </div>
      </div>
    </div>
  )
}
