import { axiosInstance } from "./axiosInstance"
import { AxiosError } from "axios"

export interface PromoCodeRequest {
  code: string
  totalAmount: number
}

export interface PromoCodeResponse {
  code: string
  discount: number
  promoId: string
}

export const validatePromoCode = async (data: PromoCodeRequest) => {
  try {
    const response = await axiosInstance.post("/promo-code/apply", data)

    if (response.data.success) {
      // The API returns: promo.code, discount, promoId: promo.id
      const promoData = response.data.data

      // Return in the expected format

      console.log(promoData)
      return {
        success: true,
        code: promoData.code,
        discount: promoData.discount,
        promoId: promoData.promoId,
      }
    } else {
      // Return empty object for failed validation
      return {
        success: false,
        message: response.data.message,
      }
    }
  } catch (error) {
    console.error("Promo validation error:", error)
    return {
      success: false,
      message: error?.response?.data.message || "Failed to apply the code",
    }
  }
}

export type DiscountType = "PERCENT" | "FIXED"

export interface PromoCode {
  id: number
  code: string
  type: DiscountType
  value: number
  maxUsage: number | null
  usedCount: number
  remainingUsage: number | null
  usagePercent: number | null
  minAmount: number | null
  expiresAt: string | null
  isActive: boolean
  isExpired: boolean
  createdAt: string
  updatedAt: string
}

export interface PromoCodesResponse {
  data: PromoCode[]
  total: number
  page: number
  totalPages: number
}

export interface GetPromoCodesParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  type?: DiscountType
}

export interface CreatePromoCodeParams {
  code: string
  type: DiscountType
  value: number
  maxUsage?: number
  minAmount?: number
  expiresAt?: string
  isActive?: boolean
}

export interface UpdatePromoCodeParams {
  type?: DiscountType
  value?: number
  maxUsage?: number
  minAmount?: number
  expiresAt?: string
  isActive?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface PromoSuccess<T> {
  success: true
  data: T
}

interface PromoError {
  success: false
  message: string
}

type PromoResult<T> = PromoSuccess<T> | PromoError

const handleAxiosError = (err: unknown): PromoError => {
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
  if (status === 404)
    return { success: false, message: "Promo code not found." }
  if (status === 400) return { success: false, message: message }
  if (status === 500)
    return { success: false, message: "Server error. Please try again later." }

  return { success: false, message }
}

export const fetchPromoCodes = async (
  params: GetPromoCodesParams = {},
): Promise<PromoResult<PromoCodesResponse>> => {
  try {
    const { page = 1, limit = 10, search, isActive, type } = params

    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search !== undefined && { search }),
      ...(isActive !== undefined && { isActive: String(isActive) }),
      ...(type !== undefined && { type }),
    })

    const res = await axiosInstance.get<ApiResponse<PromoCodesResponse>>(
      `/promo-code?${query}`,
    )

    console.log(res.data.data)
    return { success: true, data: res.data.data }
  } catch (err) {
    return handleAxiosError(err)
  }
}

export const updatePromoCode = async (
  id: number,
  params: UpdatePromoCodeParams,
): Promise<PromoResult<PromoCode>> => {
  try {
    const res = await axiosInstance.patch<ApiResponse<PromoCode>>(
      `/promo-code/${id}`,
      params,
    )

    return { success: true, data: res.data.data }
  } catch (err) {
    return handleAxiosError(err)
  }
}

export const deletePromoCode = async (
  id: number,
): Promise<PromoResult<null>> => {
  try {
    await axiosInstance.delete(`/promo-code/${id}`)

    return { success: true, data: null }
  } catch (err) {
    return handleAxiosError(err)
  }
}
