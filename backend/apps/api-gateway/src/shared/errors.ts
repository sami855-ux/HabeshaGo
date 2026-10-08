export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const Errors = {
  unauthorized: (msg = "Authentication required") => new HttpError(401, "UNAUTHORIZED", msg),
  forbidden: (msg = "Insufficient permissions") => new HttpError(403, "FORBIDDEN", msg),
  notFound: (msg = "Route not found") => new HttpError(404, "NOT_FOUND", msg),
  tooLarge: () => new HttpError(413, "PAYLOAD_TOO_LARGE", "Request body too large"),
  tooMany: () => new HttpError(429, "RATE_LIMITED", "Too many requests"),
  unavailable: (service: string) =>
    new HttpError(503, "SERVICE_UNAVAILABLE", `${service} is temporarily unavailable`),
  timeout: (service: string) =>
    new HttpError(504, "UPSTREAM_TIMEOUT", `${service} did not respond in time`),
  badGateway: (service: string) =>
    new HttpError(502, "BAD_GATEWAY", `${service} returned an invalid response`),
};
