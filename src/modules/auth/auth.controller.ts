import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../common/responses/api-response.js";
import { authService } from "./auth.service.js";
import { type RegisterInput } from "./auth.validation.js";

export async function registerController(
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await authService.register(req.body);

    return res.status(201).json(
      ApiResponse.success("User registered successfully", user)
    );
  } catch (error) {
    next(error);
  }
}