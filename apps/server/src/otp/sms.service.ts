import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: Twilio.Twilio | null = null;
  private logger = new Logger('SmsService');

  constructor() {
    if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = Twilio(
        process.env.TWILIO_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
    }
  }

  async sendSms(to: string, body: string) {
    if (!this.client) {
      this.logger.log(`SMS to ${to}: ${body} (twilio not configured)`);
      return true;
    }
    await this.client.messages.create({
      body,
      from: process.env.TWILIO_FROM,
      to,
    });
    return true;
  }
}
