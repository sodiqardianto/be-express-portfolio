import express from "express";
import multer from "multer";
import { createStorage, fileFilter, limits } from "../helpers/multer";
import fs from "fs";
import { createProject, deleteProjectById, getProjectById, getProjects, updateProjectById } from "../models/Project.model";

const storage = createStorage('public/images/projects');
export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});

export const getAllProjects = async (req: express.Request, res: express.Response) => {
    try {
        const projects = await getProjects();
        return res.status(200).json({
            message: "Projects retrieved successfully",
            data: projects
        });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
}

export const insertProject = async (req: express.Request, res: express.Response) => {    
    if (!req.file) {
        return res.status(400).json({
            message: false,
            data: {
                image: "Image is required"
            }
        });
    }

    const image = req.file;
    const imageData = {
        name: image.filename,
        url: `${req.protocol}://${req.get('host')}/images/projects/${image.filename}`
    };

    const { title, category, description, github_link, project_link } = req.body;
    if (!title || !category || !description || !github_link || !project_link) {
        
        // Remove the uploaded file if validation fails
        const imagePath = `public/images/projects/${image.filename}`;
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(`Error deleting file: ${err}`);
            }
        });
        
        return res.status(400).json({
            message: false,
            data: {
                title: title ? undefined : "Title is required",
                category: category ? undefined : "Category is required",
                description: description ? undefined : "Description is required",
                github_link: github_link ? undefined : "GitHub link is required",
                project_link: project_link ? undefined : "Project link is required"
            }
        });
    }

    try {
        const project = await createProject({
            title,
            category,
            description,
            image: imageData,
            github_link,
            project_link
        });

        res.status(201).json({
            message: "Project created successfully",
            data: project
        });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
}

export const updateProject = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const { title, category, description, github_link, project_link } = req.body;
        let imageData;

        if (!title || !category || !description || !github_link || !project_link) {
            
            if (req.file) {
                const newImagePath = `public/images/projects/${req.file.filename}`;
                fs.unlink(newImagePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error(`Error deleting new file: ${unlinkErr}`);
                    }
                });
            }

            return res.status(400).json({
                message: false,
                data: {
                    title: title ? undefined : "Title is required",
                    category: category ? undefined : "Category is required",
                    description: description ? undefined : "Description is required",
                    github_link: github_link ? undefined : "GitHub link is required",
                    project_link: project_link ? undefined : "Project link is required"
                }
            });
        }
        
        const project = await getProjectById(id);
        if (!project) {
            return res.status(404).json({
                message: "false",
                data: "Project not found"
             });
        }

        if (req.file) {
            const image = req.file;
            
            imageData = {
                name: image.filename,
                url: `${req.protocol}://${req.get('host')}/images/projects/${image.filename}`
            };

            if (project.image && project.image.name) {
                const oldImagePath = `public/images/projects/${project.image.name}`;
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) {
                            console.error(`Error deleting old image: ${err}`);
                        }
                    });
                }
            }
        }

        const projectData: {
            title: string;
            category: string;
            description: string;
            github_link: string;
            project_link: string;
            image?: { name: string; url: string };
        } = {
            title,
            category,
            description,
            github_link,
            project_link
        };

        if (imageData) {
            projectData.image = imageData;
        }

        const projectUpdated = await updateProjectById(id, projectData);
        
        return res.status(200).json({
            message: "Project updated successfully",
            data: projectUpdated
        });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
}

export const getProjectWithId = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const project = await getProjectById(id);
        
        return res.status(200).json({
            message: "Project retrieved successfully",
            data: project
        });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
}

export const destroyProjectById = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const project = await getProjectById(id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.image && project.image.name) {
            const oldImagePath = `public/images/projects/${project.image.name}`;
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        await deleteProjectById(id);

        return res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
}