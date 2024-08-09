import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        image: {
            type: {
                name: {
                    type: String,
                    required: true
                },
                url: {
                    type: String,
                    required: true
                }
            }
        },
        github_link: {
            type: String,
            required: true
        },
        project_link: {
            type: String,
        }
    },
    {
        timestamps: true
    }
);

export const ProjectModel = mongoose.model("Project", ProjectSchema);

export const createProject = (values: Record<string, any>) => new ProjectModel(values).save().then((project) => project.toObject());
export const getProjects = () => ProjectModel.find();
export const getProjectById = (id:string) => ProjectModel.findById(id);
export const updateProjectById = (id: string, values: Record<string, any>) => ProjectModel.findByIdAndUpdate(id, values, { new: true });
export const deleteProjectById = (id: string) => ProjectModel.findOneAndDelete({ _id: id});