import nodemailer from 'nodemailer';

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'samitale86@gmail.com',
        pass: 'qcit ckyk kvyi sxvx ', // Must be app password if 2FA enabled
      },
    });

    const info = await transporter.sendMail({
      from: '"Addis Pulse" <your-email@gmail.com>',
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
