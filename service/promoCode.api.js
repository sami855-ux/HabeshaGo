import { axiosInstance } from "./axiosInstance"

export const validatePromoCode = async (data) => {
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
