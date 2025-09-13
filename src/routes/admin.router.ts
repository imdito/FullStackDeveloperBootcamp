import { NextFunction, Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { CLoginAdmin } from "../controllers/auth.controller.js";

const router = Router();
const prisma = new PrismaClient();

router.post("/login", CLoginAdmin);
export default router;