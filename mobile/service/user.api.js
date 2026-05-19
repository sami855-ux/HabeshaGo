import { axiosInstance } from "./axiosInstance"

export const updateMyProfileAPI = async (formData) => {
  try {
    const res = await axiosInstance.patch("/users/me/profile", formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return res.data
  } catch (error) {
    console.error("Update profile API error:", error)
    return {
      message: "Not",
      success: false,
    }
  }
}

export const sendVerificationEmailAPI = async () => {
  try {
    const res = await axiosInstance.post("/users/me/send-otp", {
      channel: "email",
      type: "verification",
    })

    return {
      message: res.data.message,
      success: true,
      data: res.data,
    }
  } catch (error) {
    console.error("Send verification email API error:", error)
    return {
      message: "Not",
      success: false,
    }
  }
}

export const sendVerificationSMSAPI = async () => {
  try {
    const res = await axiosInstance.post("/users/me/send-verification-sms")

    return res.data
  } catch (error) {
    console.error("Send verification SMS API error:", error)
    return {
      message: "Not",
      success: false,
    }
  }
}

//type = "email" | "phone"
export const verifyCodeAPI = async (code, type) => {
  try {
    const res = await axiosInstance.post("/users/me/verify-otp", {
      code,
      channel: type === "email" ? "email" : "sms",
    })

    return {
      success: true,
      message: "Verification successful",
      data: res.data,
    }
  } catch (error) {
    console.error("Verify code API error:", error)
    return {
      message: "Not",
      success: false,
    }
  }
}

export const getUserByPhoneNumber = async (phoneNumber) => {
  try {
    const res = await axiosInstance.get("/users/by-phone", {
      params: { phone: phoneNumber },
    })

    return {
      success: true,
      data: res.data.users[0],
    }
  } catch (error) {
    console.error("Failed to fetch user by phone number:", error)

    return {
      success: false,
      message:
        error?.response?.data?.message || error.message || "Unknown error",
    }
  }
}
