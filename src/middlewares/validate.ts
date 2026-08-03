import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../common/errors/AppError.js";

export function validate<T>(schema: z.ZodType<T>) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new AppError(
          400,
          result.error.issues[0]?.message ?? "Validation failed"
        )
      );
    }

    req.body = result.data;

    next();
  };
}