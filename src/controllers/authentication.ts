import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { hashPassword, random } from "../helpers";
import { createUser, getUserByEmail, getUserByRefreshToken, updateUserById } from "../models/User.model";

declare module "express-session" {
    interface Session {
        userId: string;
    }
}

export const refreshToken = async (req: express.Request, res: express.Response) => {
    try {
        const refreshToken  = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401);
        }

        const user = await getUserByRefreshToken(refreshToken);
        if (!user) {
            return res.status(403);
        }

        const userResponse = user.toObject();
        delete userResponse.authentication;        

        jwt.verify(refreshToken, process.env.Refresh_TOKEN_SECRET!, (err: any, decoded: any) => {
            if (err) {
                return res.status(403);
            }

            const accessToken = jwt.sign({
                userResponse
            }, process.env.ACCESS_TOKEN_SECRET!,{
                expiresIn: '15s'
            });

            res.json({ accessToken });
        });
    } catch (error) {
        return res.status(400).json({ message: "Invalid token" });
    }
}

export const login = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await getUserByEmail(email).select("+authentication.salt +authentication.password");
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordMatch = hashPassword(password, user.authentication?.salt!);
        if (user.authentication?.password !== isPasswordMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const userResponse = user.toObject();
        delete userResponse.authentication;

        const accessToken = jwt.sign({
            userResponse
        }, process.env.ACCESS_TOKEN_SECRET!,{
            expiresIn: '15s'
        });

        const refreshToken = jwt.sign({
            userResponse
        }, process.env.REFRESH_TOKEN_SECRET!,{
            expiresIn: '1d'
        })

        await updateUserById(user._id.toString(), { 'authentication.refreshToken': refreshToken });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful",
            data: userResponse,
            accessToken
        });

    } catch (error) {
        return res.status(500).json({ message: error });
    }
}


export const register = async (req: express.Request , res: express.Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = random();
        const user = await createUser({
            name,
            email,
            authentication: {
                salt,
                password: hashPassword(password, salt),
            }
        });

        return res.status(200).json({
            message: "User created successfully",
            data: user
        });
        
    } catch (error) {
        return res.status(500).json({ message: error });
    }
}