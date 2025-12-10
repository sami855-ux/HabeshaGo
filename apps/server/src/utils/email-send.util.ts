import nodemailer from "nodemailer";

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // ✅ REQUIRED for Render
      auth: {
        user: "samitale86@gmail.com", // ✅ ENV ONLY
        pass: "qcit ckyk kvyi sxvx ", // ✅ APP PASSWORD ONLY
      },
      connectionTimeout: 10_000, // ✅ prevents infinite loading
    });

    const info = await transporter.sendMail({
      from: "Addis Pulse",
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw new Error("EMAIL_SEND_FAILED"); // ✅ VERY IMPORTANT
  }
}
