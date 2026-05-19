import { axiosInstance } from "./axiosInstance"

export async function initiateWalletTopup(payload) {
  try {
    const res = await axiosInstance.post("/payment/initiate", payload)

    console.log(res)
    if (res.data.success) {
      return {
        success: true,
        paymentUrl: res.data.data.paymentUrl,
        payment: res.data.data.payment,
      }
    } else {
      return {
        success: false,
        error: res.data.error || "Failed to initiate payment",
      }
    }
  } catch (error) {
    console.error("Initiate payment error:", error)
    return {
      success: false,
      error: "An error occurred while initiating payment",
    }
  }
}
