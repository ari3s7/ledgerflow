import type { Request, NextFunction } from "express";
import { AppError } from "../common/errors/AppError.js";
import { verifyAccessToken, type JwtPayload } from "../utils/jwt.js";
import { prisma } from "../lib/prisma.js";


export async function authenticate(req: Request, res: Response, next: NextFunction){
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ")? authHeader.split(" ")[1]: undefined;

    if(!token){
        throw new AppError(401, "Unauthorized")
    }

    let payload : JwtPayload;

    try {
        payload = verifyAccessToken(token);
    } catch {
        throw new AppError(401, "Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: payload.userId
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    if(!user){
        throw new AppError(401, "Unauthorized")
    }

    req.user = user;

    next();
}