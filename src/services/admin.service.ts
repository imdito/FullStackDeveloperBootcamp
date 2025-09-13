import { PrismaClient}  from "@prisma/client";
import bcrypt from "bcrypt";
import { IGlobalResponse } from "../interfaces/global.interface.js";
import { ILoginResponse } from "../interfaces/global.interface.js";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
export const Slogin = async(
    usernameOrEmail: string,
    password: string
): Promise<IGlobalResponse<ILoginResponse>> =>{
    const admin = await prisma.admin.findFirst({
        where: {
            OR: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ],
            isActive: true,
            deletedAt: null,
        }
     });
        if(!admin){
            throw Error("Invalid Credentials");
        }
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if(!isPasswordValid){
            throw Error("Invalid Credentials");
        }

        const token = UGenerateToken({
            id: admin.id,
            email: admin.email,
            username: admin.username,
            name: admin.name,
        });

        return {
            status: true,
            message: "Login successful",
            data: {
                token,
                admin: {
                    id: admin.id,
                    email: admin.email,
                    username: admin.username,
                    name: admin.name,
                }
            }
        }
    };  

function UGenerateToken(payload: { id: number; email: string; username: string; name: string; }): string {
    const secret = process.env.JWT_SECRET || "default_secret";
    return jwt.sign(payload, secret, { expiresIn: "1d" });
}

