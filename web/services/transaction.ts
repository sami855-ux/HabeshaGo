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

export const getWalletTransactionById = async (id: number | undefined) => {
  try {
    const response = await axiosInstance.get(`/transactions/${id}`)
    return response.data.data // { success, statusCode, message, data }
  } catch (error: any) {
    console.error("Error fetching wallet transaction:", error)

    // Return a consistent structure even on error
    return {
      success: false,
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch transaction",
      data: null,
    }
  }
}

export const getFinancialHistory = async () => {
  try {
    const response = await axiosInstance.get("/transactions/finance/history")

    return response.data.data // { transactions, summary }
  } catch (error: any) {
    console.error("Error fetching financial history:", error)

    throw (
      error?.response?.data || {
        message: "Failed to fetch financial history",
      }
    )
  }
}
