import { axiosInstance } from "./axiosInstance"

const phoneLogin = () => {}

export const continueWithEmail = async (email) => {
  try {
    const response = await axiosInstance.post("/auth/register", {
      email,
    })
    console.log(response)
    if (response.data.success) {
      return response.data
    } else {
      return {
        success: false,
        message: "Error when logining in with email",
      }
    }
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message)
    throw error
  }
}

export const verifyOtp = async (email, code) => {
  try {
    const response = await axiosInstance.post("/auth/app/verify-otp", {
      email,
      code,
    })

    return response.data
  } catch (error) {
    console.error(
      "OTP verification failed:",
      error.response?.data || error.message
    )
    throw error
  }
}
