import pino, { type LoggerOptions } from "pino";

export interface LoggerConfig {
  service: string;
  level?: string;
  redact?: string[];
  pretty?: boolean;
}

export function createLogger({ service, level = "info", redact = [], pretty }: LoggerConfig) {
  const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
  const isTest = process.env.NODE_ENV === "test";
  const usePretty = pretty ?? (isDev && !isTest);

  const options: LoggerOptions = {
    level: isTest ? "silent" : level,
    base: {
      service,
      environment: process.env.NODE_ENV ?? "development",
    },
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
    },
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
    },
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.headers['x-internal-token']",
        "password",
        "*.password",
        "token",
        "*.token",
        "secret",
        "*.secret",
        ...redact,
      ],
      censor: "[REDACTED]",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  if (usePretty) {
    return pino({
      ...options,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "yyyy-mm-dd HH:MM:ss.l",
          ignore: "pid,hostname",
          singleLine: false,
          errorLikeObjectKeys: ["err", "error"],
        },
      },
    });
  }

  return pino(options);
}

export { pino };
