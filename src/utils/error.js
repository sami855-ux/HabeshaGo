export class NotFound extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.status = 404;
  }
}

export class Conflict extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
    this.status = 409;
  }
}
