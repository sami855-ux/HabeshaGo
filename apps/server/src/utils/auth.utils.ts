import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';

export function generateOtp(): string {
  // 6-digit numeric OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP HASHING
export function generateOtpHash(otp: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(otp, salt);
}

export function verifyOtpHash(otp: string, hash: string): boolean {
  return bcrypt.compareSync(otp, hash);
}

// GOOGLE TOKEN VERIFICATION
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
}
