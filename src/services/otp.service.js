import prisma from "../prisma/client.js";
import { generateOTP } from "../utils/otp.js";
import { transporter } from "../config/mail.js";

export const sendOTP = async (user) => {
  const code = generateOTP();

  await prisma.otpCode.create({
    data: {
      codeHash: code, // later you should hash this
      userId: user.id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  await transporter.sendMail({
    from: `"Addis Pulse " <danikume27@gmail.com`,
    to: user.email,
    subject: "Your OTP Code",
    text: `Your verification code is ${code}`,
  });
};
