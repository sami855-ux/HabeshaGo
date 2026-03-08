import { axiosInstance } from "@/service/axiosInstance"

export const getWalletTransactions = async () => {
  try {
    const response = await axiosInstance.get("/wallet/transactions")
    return response.data.data
  } catch (error) {
    console.error("Error fetching wallet transactions:", error)
    return null
  }
}

export const getUserWallet = async () => {
  try {
    const response = await axiosInstance.get("/wallet/me")
    return response.data.data
  } catch (error) {
    console.error("Error fetching user wallet:", error)
    return null
  }
}

export const createUserWallet = async (pin) => {
  try {
    const response = await axiosInstance.post("/wallet/create", { pin })
    return response.data.data
  } catch (error) {
    console.error("Error creating user wallet:", error)
    return null
  }
}

export const updateBiometricAPI = async (enable) => {
  try {
    const response = await axiosInstance.patch("/wallet/biometric", { enable })
    return response.data.data
  } catch (error) {
    console.error("Error updating biometric setting:", error)
    return null
  }
}

export const changePinAPI = async (currentPin, newPin) => {
  try {
    const response = await axiosInstance.patch("/wallet/change-pin", {
      currentPin,
      newPin,
    })

    console.log(response)
    return {
      success: response.data.success,
      message: response.data.message,
      wallet: response.data.data,
    }
  } catch (error) {
    console.error("Error changing wallet PIN:", error)
    return null
  }
}

export const verifyPin = async (pin) => {
  try {
    const res = await axiosInstance.post("/wallet/verify-pin", {
      pin,
    })

    if (res.data.success) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error("Error verifying wallet PIN:", error)
    return false
  }
}

export const getTransactionById = async (id) => {}
