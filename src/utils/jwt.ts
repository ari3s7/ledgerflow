import jwt from 'jsonwebtoken'
import { env } from "../config/env.js"

export function generateAccessToken(userId: string) {
    return jwt.sign(
        {userId},
        env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
        }
    );
}

export function generateRefreshToken(userId: string){
    return jwt.sign(
        {userId},
        env.REFRESH_TOKEN_SECRET, {
            expiresIn: env.REFRESH_TOKEN_EXPIRES_IN
        }
    );
}