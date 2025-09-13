import { NextFunction, Request, Response } from "express";
import { IGlobalResponse } from "../interfaces/global.interface.js";

export const MErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) : void =>{
    console.error("Error: ", err);


    const isDevelopment = process.env.NODE_ENV === "development";
    if(err instanceof Error){

        const errorobj: any = { message: err.message  };
        if(err.name){
            errorobj.name = err.name;
        }
        if(isDevelopment && err.stack){
            errorobj.stack = err.stack;
        }
        
        Response.error = errorobj;
        res.status(400).json(Response);
    
    }else{
        const anyErr = err as any;
        const Response : IGlobalResponse = {
            status: false,
            message : "An unexpected error occurred",
            error: {
                message: "Internal Server Error",
                ...(isDevelopment && {detail: anyErr.stack}),
            }
        };
        res.status(500).json(Response);
    }

}