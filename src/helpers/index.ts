import bcryptjs from "bcryptjs";

export const random = () => bcryptjs.genSaltSync(10);

export const hashPassword = (password: string, salt: string) =>
    bcryptjs.hashSync(password, salt);

export const comparePassword = (password: string, hash: string) =>
    bcryptjs.compareSync(password, hash);