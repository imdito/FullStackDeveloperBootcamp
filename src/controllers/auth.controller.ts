import { PrismaClient } from "@prisma/client";
import { NextFunction, Router, Request, Response } from "express";
const prisma = new PrismaClient();
const router = Router();

export const CLoginAdmin  =  async (req: Request, res: Response, _next: NextFunction) => {
    const { username, password } = req.body;

    const user = await prisma.admin.findUnique({
        where: { username: username}
    });

    if(!user){
        return res.status(404).json({
            message: "User not found"
        });
    }

    if(!user.isActive || user.deletedAt){
        return res.status(404).json({
            message: "User is inactive or deleted"
        });
    }

    if(user.password !== password){
        return res.status(404).json({
            message: "Invalid Credentials"
        });
    }
    return res.status(200).json({
        message: "Login successful",
        data: { id: user.id, username: user.username,email: user.email,name: user.name }
    });
         
};