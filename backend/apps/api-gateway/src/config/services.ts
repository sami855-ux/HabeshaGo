import { env } from "./env";

export type AuthMode = "public" | "user";

export interface PublicRule {
  method: string;
  path: RegExp;
}

export interface ServiceRoute {
  name: string;
  prefix: string;
  target: string;
  stripPrefix: boolean;
  auth: AuthMode;
  publicRules?: PublicRule[];
  roles?: string[];
  timeoutMs: number;
  retries: number;
  websocket?: boolean;
}

const base = { stripPrefix: false, auth: "user" as const, retries: 0 };

export const services: ServiceRoute[] = [
  {
    ...base,
    name: "auth",
    prefix: "/api/v1/auth",
    target: env.AUTH_SERVICE_URL,
    publicRules: [
      { method: "POST", path: /^\/api\/v1\/auth\/(continue-with-email|verify-otp|resend-otp|mfa\/verify|totp\/verify|refresh|staff\/(login|verify-otp|otp\/verify|mfa\/verify|resend-otp))$/ },
      { method: "GET", path: /^\/api\/v1\/auth\/google(\/callback)?$/ },
    ],
    timeoutMs: 8000,
  },
  {
    ...base,
    name: "profile",
    prefix: "/api/v1/profiles",
    target: env.PROFILE_SERVICE_URL,
    timeoutMs: 8000,
    retries: 1,
  },
  {
    ...base,
    name: "mobility",
    prefix: "/api/v1/mobility",
    target: env.MOBILITY_SERVICE_URL,
    timeoutMs: 10000,
    retries: 1,
    websocket: true,
  },
  {
    ...base,
    name: "ticket",
    prefix: "/api/v1/tickets",
    target: env.TICKET_SERVICE_URL,
    timeoutMs: 10000,
  },
  {
    ...base,
    name: "payment",
    prefix: "/api/v1/payments",
    target: env.PAYMENT_SERVICE_URL,
    publicRules: [{ method: "POST", path: /^\/api\/v1\/payments\/webhooks\/chapa$/ }],
    timeoutMs: 15000,
  },
  {
    ...base,
    name: "parking",
    prefix: "/api/v1/parking",
    target: env.PARKING_SERVICE_URL,
    timeoutMs: 8000,
    retries: 1,
  },
  {
    ...base,
    name: "ev",
    prefix: "/api/v1/ev",
    target: env.EV_SERVICE_URL,
    timeoutMs: 8000,
    retries: 1,
  },
  {
    ...base,
    name: "employee",
    prefix: "/api/v1/employees",
    target: env.EMPLOYEE_SERVICE_URL,
    roles: ["admin", "employee"],
    timeoutMs: 8000,
  },
  {
    ...base,
    name: "notification",
    prefix: "/api/v1/notifications",
    target: env.NOTIFICATION_SERVICE_URL,
    timeoutMs: 8000,
    retries: 1,
  },
  {
    ...base,
    name: "reporting",
    prefix: "/api/v1/reports",
    target: env.REPORTING_SERVICE_URL,
    roles: ["admin"],
    timeoutMs: 25000,
  },
];
