import { Router } from "express";
import {
  googleAuthRedirect,
  getGoogleAuthUrlHandler,
  googleAuthCallback,
  googleTokenAuth,
  exchangeOAuthCode,
} from "../controllers/google.controller";

export const googleRouter = Router();

googleRouter.get("/google", googleAuthRedirect);
googleRouter.get("/google/url", getGoogleAuthUrlHandler);
googleRouter.get("/google/callback", googleAuthCallback);
googleRouter.post("/google", googleTokenAuth);
googleRouter.post("/mobile/google", googleTokenAuth);
googleRouter.get("/exchange", exchangeOAuthCode);
googleRouter.post("/exchange", exchangeOAuthCode);
googleRouter.get("/google/exchange", exchangeOAuthCode);
googleRouter.post("/google/exchange", exchangeOAuthCode);
