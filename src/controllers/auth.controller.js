import prisma from "../prisma/client.js";
import { sendOTP } from "../services/otp.service.js";
import { generateToken } from "../services/token.service.js";

export const register = async (req, res) => {
  const { email } = req.body;

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { email },
    });
  }

  await sendOTP(user);

  res.json({ message: "OTP sent to email" });
};

export const verifyOTP = async (req, res) => {
  const { email, code } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const otp = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      codeHash: code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  // mark OTP as used
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { used: true },
  });

  // verify user
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });

  const token = generateToken(user);

  res.json({ email,token });
};
