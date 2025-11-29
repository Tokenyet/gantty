// Domain-specific error classes for the projects feature

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public constraint: string
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends Error {
  constructor(
    public entityType: string,
    public entityId: string
  ) {
    super(`${entityType} with id ${entityId} not found`);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
