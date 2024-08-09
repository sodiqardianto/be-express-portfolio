import express from "express";
import multer from "multer";
import { upload } from "../controllers/project";

export const handleSingleUpload = (fieldName: string) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    upload.single(fieldName)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    message: false,
                    data: {
                        image: 'File size too large. Max limit is 5MB.'
                    }
                });
            }
            return res.status(400).json({ message: false, data: err.message });
        } else if (err) {
            return res.status(400).json({
                message: false,
                data: {
                    image: err.message
                }
            });
        }
        next();
    });
};