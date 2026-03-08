import { axiosInstance } from "./axiosInstance"

export const transferFunds = async (
  recipientId: string,
  amount: number,
  pin: string,
  description?: string,
) => {
  console.log(recipientId, amount, pin, description)
  try {
    const response = await axiosInstance.post("/transactions/transfer", {
      recipientId,
      amount,
      pin,
      description,
    })

    console.log(response)

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
      }
    } else {
      return {
        success: false,
        message: response.data.message || "Transaction failed",
      }
    }
  } catch (error: any) {
    console.error("Transaction failed:", error)
    return {
      success: false,
      message:
        error?.response?.data?.message || error.message || "Unknown error",
    }
  }
}
