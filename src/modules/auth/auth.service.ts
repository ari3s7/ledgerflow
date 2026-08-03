import bcrypt from "bcrypt";
import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import type { RegisterInput } from "./auth.validation.js";

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
    }
}