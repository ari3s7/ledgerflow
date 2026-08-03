import bcrypt from "bcrypt";
import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { REFRESH_TOKEN_COOKIE_MAX_AGE } from "../../common/constants/auth.js";

const SALT_ROUNDS = 10;

   export const authService = {
    async register(data: RegisterInput){
        const existingUser = await prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });

        if(existingUser){
            throw new AppError(409, "User already exists");
        }
        
        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

        return prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            },
        });
    },

    async login(data: LoginInput){
     const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        }
     })
     if(!user){
        throw new AppError(401, "Invalid email or password")
     }
     const isPasswordValid = await bcrypt.compare(data.password, user.password)

     if(!isPasswordValid){
        throw new AppError(401, "Invalid email or password")
     }

     const accessToken = generateAccessToken(user.id);
     const refreshToken = generateRefreshToken(user.id);

     await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date( Date.now() + REFRESH_TOKEN_COOKIE_MAX_AGE), 
        }
     })

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
      };
    }
}