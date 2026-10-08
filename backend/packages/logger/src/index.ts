import pino, { type LoggerOptions } from "pino";

export interface LoggerConfig {
  service: string;
  level?: string;
  redact?: string[];
}

export function createLogger({ service, level = "info", redact = [] }: LoggerConfig) {
  const options: LoggerOptions = {
    level,
    base: { service },
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.headers['x-internal-token']",
        ...redact,
      ],
      censor: "[redacted]",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };
  return pino(options);
}
