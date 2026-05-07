import dotenv from "dotenv"
dotenv.config()

import { Resend } from "resend"
import { successResponse, errorResponse } from "../utils/apiResponse.js"

const resend = new Resend("re_Fsm1xGsT_2gSKwnZWB31nZ81mjhHf2iFy");

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: "HabeshaGo <onboarding@resend.dev>",
      to,
      subject,
      html,
    })

    return {
      success: true,
      message: "Email sent successfully",
      data: response,
    }
  } catch (error) {
    console.error("Error sending email with Resend:", error)
    return errorResponse("Failed to send email")
  }
}
