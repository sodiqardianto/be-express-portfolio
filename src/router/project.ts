import express from "express";
import { verifyToken } from "../middlewares";
import { handleSingleUpload } from "../middlewares/multerUpload";
import { destroyProjectById, getAllProjects, getProjectWithId, insertProject, updateProject } from "../controllers/project";

export default (router: express.Router) => {
    router.get("/projects", getAllProjects);
    router.post("/projects", verifyToken, handleSingleUpload('image'), insertProject);
    router.put("/projects/:id", verifyToken, handleSingleUpload('image'), updateProject);
    router.get("/projects/:id", getProjectWithId);
    router.delete("/projects/:id", verifyToken, destroyProjectById);
}