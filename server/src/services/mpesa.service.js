import axios from "axios"
import moment from "moment"

import dotenv from "dotenv"
dotenv.config()

// Environment variables
const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  MPESA_CALLBACK_URL,
} = process.env

// Generate M-Pesa access token
export const getAccessToken = async () => {
  const auth = Buffer.from(
    `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`,
  ).toString("base64")
  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } },
  )
  return res.data.access_token
}

// Generate STK Push password
const generatePassword = (timestamp) => {
  return Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString(
    "base64",
  )
}

// Initiate STK Push
export const stkPush = async ({ phone, amount, reference }) => {
  try {
    const token = await getAccessToken()
    const timestamp = moment().format("YYYYMMDDHHmmss")
    const password =
      "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjYwNDAxMTYzOTI2"

    // Format phone number (254 prefix)
    let formattedPhone = phone.startsWith("0") ? "254" + phone.slice(1) : phone

    // Construct payload
    const payload = {
      BusinessShortCode: MPESA_SHORTCODE, // e.g., "174379"
      Password: password, // generated from shortcode + passkey + timestamp
      Timestamp: timestamp, // YYYYMMDDHHMMSS
      TransactionType: "CustomerPayBillOnline",
      Amount: Number(amount), // e.g., 1, 10, 100
      PartyA: 254722000000, // customer phone initiating payment
      PartyB: MPESA_SHORTCODE, // your paybill shortcode
      PhoneNumber: formattedPhone, // same as PartyA
      CallBackURL: MPESA_CALLBACK_URL, // your endpoint for callback
      AccountReference: reference, // your reference string
      TransactionDesc: "HabeshaGo Wallet Top-up",
    }

    // Send request
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    )

    console.log("✅ STK Push Sent:", response.data)
    return response.data
  } catch (error) {
    console.error("❌ STK Push Error:", error.response?.data || error.message)
    throw new Error("Failed to initiate M-Pesa STK push")
  }
}

// Example usage
// stkPush({ phone: "0708374149", amount: 1, reference: "Test123" });
const getToken = async () => {
  try {
    const auth = Buffer.from(
      `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`,
    ).toString("base64")
    const res = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } },
    )
    console.log("✅ Token:", res.data.access_token)
  } catch (err) {
    console.error("❌ Token Error:", err.response?.data || err.message)
  }
}

getToken()
