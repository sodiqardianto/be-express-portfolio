import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    authentication: {
      password: {
        type: String,
        required: true,
        select: false,
      },
      salt: {
        type: String,
        required: true,
        select: false,
      },
      sessionToken: {
        type: String,
        required: true,
        select: false,
      },
      refreshToken: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model("User", UserSchema);

export const createUser = (values: Record<string, any>) => new UserModel(values).save().then((user) => user.toObject());
export const updateUserById = (id: string, values: Record<string, any>) => UserModel.findByIdAndUpdate(id, values, { new: true });
export const getUserByEmail = (email: string) => UserModel.findOne({ email });
export const getUserByRefreshToken = (refreshToken: string) => UserModel.findOne({ 'authentication.refreshToken': refreshToken });
