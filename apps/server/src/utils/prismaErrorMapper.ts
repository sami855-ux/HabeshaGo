import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

type PrismaErrorCode = string;

interface ErrorMapping {
  message: string | ((error: Prisma.PrismaClientKnownRequestError) => string);
  code: string;
  statusCode: number;
}

// Generic + customizable mapping
const KNOWN_PRISMA_ERRORS: Record<PrismaErrorCode, ErrorMapping> = {
  // Unique constraint violation (works for any field on any model)
  P2002: {
    message: (error) => {
      const target = (error.meta?.target as string[])?.join(', ') || 'field';
      return `The value for "${target}" already exists. It must be unique.`;
    },
    code: 'UNIQUE_CONSTRAINT_VIOLATION',
    statusCode: 409,
  },

  // Foreign key constraint failed
  P2003: {
    message: 'A related record does not exist or cannot be deleted.',
    code: 'FOREIGN_KEY_VIOLATION',
    statusCode: 400,
  },

  // Record not found (findUnique, findFirst with no result + .findUniqueOrThrow, etc.)
  P2025: {
    message: 'The requested record was not found.',
    code: 'RECORD_NOT_FOUND',
    statusCode: 404,
  },

  // Record required but not provided (e.g., delete/update on non-existent record)
  P2015: {
    message: 'Related record not found.',
    code: 'RELATED_RECORD_NOT_FOUND',
    statusCode: 404,
  },

  // Query parsing / validation errors
  P1000: {
    message: 'Database authentication failed.',
    code: 'DB_AUTH_FAILED',
    statusCode: 500,
  },
  P1001: {
    message: 'Cannot reach database server.',
    code: 'DB_UNREACHABLE',
    statusCode: 503,
  },
  P1002: {
    message: 'Database query timed out.',
    code: 'DB_TIMEOUT',
    statusCode: 504,
  },
};

export const mapPrismaError = (error: unknown): AppError => {
  // 1. Prisma known request errors (most common in services)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapping = KNOWN_PRISMA_ERRORS[error.code];

    if (mapping) {
      const message =
        typeof mapping.message === 'function'
          ? mapping.message(error)
          : mapping.message;

      return new AppError(message, mapping.code, mapping.statusCode, {
        prismaCode: error.code,
        target: error.meta?.target,
      });
    }

    // Unknown Prisma error code
    return new AppError(
      `Database operation failed (${error.code})`,
      'PRISMA_UNKNOWN_ERROR',
      500,
      { prismaCode: error.code },
    );
  }

  // 2. Validation / query building errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError(
      'Invalid query sent to the database.',
      'QUERY_VALIDATION_ERROR',
      400,
    );
  }

  // 3. Connection / initialization errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError(
      'Failed to connect to the database.',
      'DB_CONNECTION_ERROR',
      503,
    );
  }

  // 4. Any other error (network, unexpected, etc.)
  if (error instanceof Error) {
    return new AppError(
      error.message || 'An unexpected error occurred.',
      'INTERNAL_SERVER_ERROR',
      500,
    );
  }

  // Final fallback
  return new AppError('An unknown error occurred.', 'UNKNOWN_ERROR', 500);
};
