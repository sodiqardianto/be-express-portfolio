import express from "express";
import authentication from "./authentication";
import project from "./project";

const router = express.Router();

export default(): express.Router => {
    authentication(router);
    project(router);
    return router;
}