import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  try {
    const data = await resend.emails.send({
      from: "Addis Pulse <onboarding@resend.dev>", // ✅ works instantly without domain setup
      to,
      subject,
      html: html || `<p>${text}</p>`,
      text,
    });

    console.log("✅ Resend email sent:", data.id);
    return true;
  } catch (error) {
    console.error("❌ Resend email failed:", error);
    throw new Error("EMAIL_SEND_FAILED");
  }
}
