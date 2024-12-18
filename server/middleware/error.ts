
import ErrorHandler from "../utils/ErrorHandler";
import { NextFunction, Request , Response } from "express";

export const ErrorMiddleware = (
    err:any,
    req:Request, 
    res: Response, 
    next:NextFunction) => {

    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'internal server error';

    //invalid mongodb id
    if(err.name === 'castError'){
        const message = 'Resource not found , invalid: $(err.path)';
        err = new ErrorHandler(message, 400);
    }
    if(err.code === 11000){

    
        const message = 'Duplicate ${Object.keys(err.keyvalue)} entered';

        err = new ErrorHandler(message,400);
    }

    // wrong jwt error
    if(err.name == 'JsonWebTokkenError'){
        const message = 'json web token invalid , try again';
        err = new ErrorHandler(message, 400);
    }

    // jwt expired error
    if(err.name === 'TokenExpiredError'){
        const message = 'json web token  is expired ,try again';
        err = new ErrorHandler(message,400);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}
