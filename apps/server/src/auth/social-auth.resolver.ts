import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { SocialAuthService } from './social-auth.service';
import { AuthUser } from './dto/auth.dto';

@Resolver()
export class SocialAuthResolver {
  constructor(private readonly socialAuth: SocialAuthService) {}

  @Mutation(() => AuthUser)
  async loginWithGoogle(
    @Args('token') token: string, // Google ID Token
  ) {
    // Here you can verify token with Google API
    const profile = await this.verifyGoogleToken(token);
    return this.socialAuth.validateSocialUser(profile, 'google');
  }

  @Mutation(() => AuthUser)
  async loginWithApple(
    @Args('token') token: string, // Apple ID Token
  ) {
    // Verify Apple token here
    const profile = await this.verifyAppleToken(token);
    return this.socialAuth.validateSocialUser(profile, 'apple');
  }

  private async verifyGoogleToken(token: string) {
    // Use Google API to verify token
    // npm install google-auth-library
    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return { email: payload?.email, name: payload?.name };
  }

  private async verifyAppleToken(token: string) {
    // Verify Apple token using apple-signin-auth or similar
    const { verifyIdToken } = await import('apple-signin-auth');
    const payload = await verifyIdToken(token, {
      audience: process.env.APPLE_CLIENT_ID,
      ignoreExpiration: false,
    });
    return { email: payload.email, name: payload.sub };
  }
}
