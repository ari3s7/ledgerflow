import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../common/responses/api-response.js";
import { authService } from "./auth.service.js";
import { type LoginInput, type RegisterInput } from "./auth.validation.js";
import { env } from "../../config/env.js";
import { REFRESH_TOKEN_COOKIE_MAX_AGE } from "../../common/constants/auth.js";

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

export async function loginController(
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const { accessToken, refreshToken, user } = await authService.login(
      req.body
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
    });

    return res.status(200).json(
      ApiResponse.success("Login successful", {
        accessToken,
        user,
      })
    );
  } catch (error) {
    next(error);
  };
}

export function getMeController(req: Request, res: Response) {
  return res.status(200).json(
    ApiResponse.success("User fetched successfully", req.user)
  );
}

