// 1. Base generic (keep it, but you’ll rarely use it directly)
class ApiResponseDto<T> {
  success = true;
  message = '';
  count?: number;
  data!: T; // ! = non-null assertion (safe because we always set it)

  constructor(partial?: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
  }
}

// 2. Ready-to-use concrete classes (no more <T> errors!)
export class ListResponseDto<T> extends ApiResponseDto<T[]> {
  constructor(data: T[], message?: string) {
    super({
      message:
        message ??
        (data.length === 0 ? 'No records found' : 'Retrieved successfully'),
      count: data.length,
      data,
    });
  }
}

export class SingleResponseDto<T> extends ApiResponseDto<T> {
  constructor(data: T, message = 'Operation successful') {
    super({ message, data });
  }
}

// Optional shortcut types for OpenAPI/Swagger
export type ListResponse<T> = ListResponseDto<T>;
export type SingleResponse<T> = SingleResponseDto<T>;
