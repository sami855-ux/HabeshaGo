import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '../src/prisma/index';
import { emailOTP } from 'better-auth/plugins';
import { sendEmail } from 'src/utils/email-send.util';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 30 },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        let subject = '';
        let message = '';

        if (type === 'sign-in') {
          subject = 'Your Sign-In Code';
          message = `Your sign-in code is: ${otp}. Expires in 5 minutes.`;
        } else if (type === 'email-verification') {
          subject = 'Verify Your Email';
          message = `Your verification code is: ${otp}. Expires in 5 minutes.`;
        } else if (type === 'forget-password') {
          subject = 'Password Reset Code';
          message = `Your password reset code is: ${otp}. Expires in 5 minutes.`;
        }

        // DEV: Send via Nodemailer + Ethereal
        try {
          const info = await sendEmail(
            email,
            subject,
            message,
            `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px; background-color: #fafafa;">
              <h2 style="color: #00796B; text-align: center;">Addis Pulse</h2>
              <p>Hi,</p>
              <p>${message}</p>
              <p style="font-size: 18px; font-weight: bold; color: #E53935; text-align: center;">${otp}</p>
              <p style="margin-top: 20px;">This code will expire in 5 minutes. Do not share it with anyone.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888; text-align: center;">
                If you did not request this email, please ignore it.
              </p>
            </div>
          `,
          );

          return;
        } catch (err: any) {
          console.error('Failed to send dev email:', err);
          return;
        }
      },

      otpLength: 6,
      expiresIn: 300, // 5 minutes
      allowedAttempts: 3,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
    }),
  ],

  callbacks: {
    signIn({ user }: { user: { email: string } }) {
      console.log('User signed in:', user.email);
      return true;
    },
    signUp({ user }: { user: { email: string } }) {
      console.log('New user signed up:', user.email);
      return true;
    },
  },
});
