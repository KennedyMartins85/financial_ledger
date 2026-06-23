// src/shared/errors/validation-error.ts
import { AppError } from "./app-error.js";

export class ValidationError extends AppError {
  readonly statusCode = 422;
}