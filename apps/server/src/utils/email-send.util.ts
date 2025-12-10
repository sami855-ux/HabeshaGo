import { Resend } from 'resend';

const resend = new Resend('re_JHze1bAf_J1AWeLDkPKrnf5i23umgieNK');

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
) {
  try {
    const data = await resend.emails.send({
      from: 'Addis Pulse <onboarding@resend.dev>', // ✅ works instantly without domain setup
      to,
      subject,
      html: html || `<p>${text}</p>`,
      text,
    });

    console.log('✅ Resend email sent:');
    return true;
  } catch (error) {
    console.error('❌ Resend email failed:', error);
    throw new Error('EMAIL_SEND_FAILED');
  }
}
