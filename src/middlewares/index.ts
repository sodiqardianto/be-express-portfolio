import express from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            email?: string;
        }
    }
}

export const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {

        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Invalid token" });
            }
            req.email = (decoded as {email: string}).email
            next();
        })

    } catch (error) {
        return res.status(500).json({ message: error });
    }
}