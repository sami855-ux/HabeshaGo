import { axiosInstance } from "./axiosInstance"
import { AxiosError } from "axios"
import { format } from "date-fns"

// Response shape from your API wrapper
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Individual data shapes
export interface FinancialSummary {
  totalRevenue: number
  totalCommission: number
  adminWalletBalance: number
  previousPeriodRevenue: number
  revenueGrowth: number
  activeProviders: number
}

export interface ProviderPerformance {
  providerId: string
  providerName: string
  totalRevenue: number
  totalCommission: number
  growth: number
  rank: number
}

export interface RevenueTrend {
  date: string
  formattedDate: string
  revenue: number
}

// Return types
interface DashboardSuccess {
  success: true
  data: {
    financialSummary: FinancialSummary
    providersPerformance: ProviderPerformance[]
    revenueTrends: RevenueTrend[]
  }
}

interface DashboardError {
  success: false
  message: string
}

type DashboardResult = DashboardSuccess | DashboardError

// ── Data shapes
export interface CommissionDataPoint {
  date: string
  totalCommission: number
  transactions: number
  averageCommission: number
}

export interface CommissionSummary {
  totalCommission: number
  totalTransactions: number
  previousPeriodCommission: number
  previousPeriodTransactions: number
}

// Params
export type GroupBy = "day" | "week" | "month"

interface DateRangeParams {
  from: Date
  to: Date
  groupBy?: GroupBy
}

// API response wrapper
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Return types
interface CommissionReportSuccess {
  success: true
  data: {
    report: CommissionDataPoint[]
    summary: CommissionSummary
  }
}

interface CommissionReportError {
  success: false
  message: string
}

type CommissionReportResult = CommissionReportSuccess | CommissionReportError

export interface WalletSummary {
  availableBalance: number
  pendingBalance: number
  totalEarned: number
  totalWithdrawn: number
  lastWithdrawalDate: string
  pendingWithdrawalsCount: number
  successRate: number
}

export interface EarningDataPoint {
  date: string
  earnings: number
}

export interface Withdrawal {
  id: string
  amount: number
  status: "COMPLETED" | "PENDING" | "FAILED"
  date: string
  method: string
  reference: string
}

export interface WithdrawalsResponse {
  data: Withdrawal[]
  total: number
  page: number
  totalPages: number
}

interface WithdrawalsParams {
  status?: "all" | "completed" | "pending" | "failed"
  page?: number
  limit?: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface WalletDashboardSuccess {
  success: true
  data: {
    summary: WalletSummary
    earnings: EarningDataPoint[]
    withdrawals: WithdrawalsResponse
  }
}

interface WalletDashboardError {
  success: false
  message: string
}

type WalletDashboardResult = WalletDashboardSuccess | WalletDashboardError

// Function
export const fetchAdminDashboardData = async (
  daysFilter: number = 7,
): Promise<DashboardResult> => {
  try {
    const [financialSummary, providersPerformance, revenueTrends] =
      await Promise.all([
        axiosInstance.get<ApiResponse<FinancialSummary>>(
          "/stat/financial-summary",
        ),
        axiosInstance.get<ApiResponse<ProviderPerformance[]>>(
          "/stat/providers-performance",
        ),
        axiosInstance.get<ApiResponse<RevenueTrend[]>>(
          `/stat/revenue-trends?days=${daysFilter}`,
        ),
      ])

    return {
      success: true,
      data: {
        financialSummary: financialSummary.data.data,
        providersPerformance: providersPerformance.data.data,
        revenueTrends: revenueTrends.data.data,
      },
    }
  } catch (err) {
    const error = err as AxiosError<{ message: string }>
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    if (status === 401) {
      return { success: false, message: "Unauthorized. Please log in again." }
    }

    if (status === 403) {
      return {
        success: false,
        message: "You do not have permission to access this resource.",
      }
    }

    if (status === 500) {
      return {
        success: false,
        message: "Server error. Please try again later.",
      }
    }

    return { success: false, message }
  }
}

export const fetchCommissionReportData = async ({
  from,
  to,
  groupBy = "day",
}: DateRangeParams): Promise<CommissionReportResult> => {
  try {
    const fromStr = format(from, "yyyy-MM-dd")
    const toStr = format(to, "yyyy-MM-dd")

    const [report, summary] = await Promise.all([
      axiosInstance.get<ApiResponse<CommissionDataPoint[]>>(
        `/stat/commission-report?groupBy=${groupBy}&from=${fromStr}&to=${toStr}`,
      ),
      axiosInstance.get<ApiResponse<CommissionSummary>>(
        `/stat/commission-summary?from=${fromStr}&to=${toStr}`,
      ),
    ])

    return {
      success: true,
      data: {
        report: report.data.data,
        summary: summary.data.data,
      },
    }
  } catch (err) {
    const error = err as AxiosError<{ message: string }>
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    if (status === 401) {
      return { success: false, message: "Unauthorized. Please log in again." }
    }

    if (status === 403) {
      return {
        success: false,
        message: "You do not have permission to access this resource.",
      }
    }

    if (status === 500) {
      return {
        success: false,
        message: "Server error. Please try again later.",
      }
    }

    return { success: false, message }
  }
}

const handleAxiosError = (err: unknown): WalletDashboardError => {
  const error = err as AxiosError<{ message: string }>
  const status = error.response?.status
  const message = error.response?.data?.message || error.message

  if (status === 401)
    return { success: false, message: "Unauthorized. Please log in again." }
  if (status === 403)
    return {
      success: false,
      message: "You do not have permission to access this resource.",
    }
  if (status === 500)
    return { success: false, message: "Server error. Please try again later." }

  return { success: false, message }
}

export const fetchWalletDashboardData = async (
  days: number = 14,
  withdrawalParams: WithdrawalsParams = {},
): Promise<WalletDashboardResult> => {
  try {
    const { status = "all", page = 1, limit = 5 } = withdrawalParams

    const [summary, earnings, withdrawals] = await Promise.all([
      axiosInstance.get<ApiResponse<WalletSummary>>("/stat/wallet-summary"),
      axiosInstance.get<ApiResponse<EarningDataPoint[]>>(
        `/stat/wallet-earnings?days=${days}`,
      ),
      axiosInstance.get<ApiResponse<WithdrawalsResponse>>(
        `/stat/withdrawals?status=${status}&page=${page}&limit=${limit}`,
      ),
    ])

    return {
      success: true,
      data: {
        summary: summary.data.data,
        earnings: earnings.data.data,
        withdrawals: withdrawals.data.data,
      },
    }
  } catch (err) {
    return handleAxiosError(err)
  }
}

interface WithdrawalsSuccess {
  success: true
  data: WithdrawalsResponse
}

type WithdrawalsResult = WithdrawalsSuccess | WalletDashboardError

export const fetchWithdrawals = async (
  params: WithdrawalsParams = {},
): Promise<WithdrawalsResult> => {
  try {
    const { status = "all", page = 1, limit = 5 } = params

    const res = await axiosInstance.get<ApiResponse<WithdrawalsResponse>>(
      `/stat/withdrawals?status=${status}&page=${page}&limit=${limit}`,
    )

    return { success: true, data: res.data.data }
  } catch (err) {
    return handleAxiosError(err)
  }
}

export interface KpiItem {
  title: string
  value: string
  subtitle: string
  change: string
  trend: "up" | "down"
  details: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface KpisSuccess {
  success: true
  data: KpiItem[]
}

interface KpisError {
  success: false
  message: string
}

type KpisResult = KpisSuccess | KpisError

export const fetchKpis = async (): Promise<KpisResult> => {
  try {
    const res = await axiosInstance.get<ApiResponse<KpiItem[]>>("/stat/kpis")

    return {
      success: true,
      data: res.data.data,
    }
  } catch (err) {
    const error = err as AxiosError<{ message: string }>
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    if (status === 401)
      return { success: false, message: "Unauthorized. Please log in again." }
    if (status === 403)
      return {
        success: false,
        message: "You do not have permission to access this resource.",
      }
    if (status === 500)
      return {
        success: false,
        message: "Server error. Please try again later.",
      }

    return { success: false, message }
  }
}
