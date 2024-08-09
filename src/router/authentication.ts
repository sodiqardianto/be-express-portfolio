import express from "express";
import { login, refreshToken, register } from "../controllers/authentication";

export default (router: express.Router) => {
    router.post("/auth/register", register);
    router.post("/auth/login", login);
    router.get("/auth/refresh-token", refreshToken);
}