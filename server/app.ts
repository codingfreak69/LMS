require('dotenv').config();
import express, {NextFunction,Response, Request } from "express";
import {ErrorMiddleware} from "./middleware/error";
export const app = express();

import cors from "cors";
import cookieParser from "cookie-parser";

//body parser

app.use(express.json({limit: "50mb"}));

//cookie parser

app.use(cookieParser());

// cors => cors origin resource sharing  //////////////////////////////////////

app.use(cors({
    origin: process.env.ORIGIN
}));
// using the errorhandlers///////////////////////////////////
app.use(ErrorMiddleware);

//testing the api

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "API is working",
    });
});

app.all("*", (req: Request, res: Response, next: NextFunction ) => {
    const err = new Error('Route ${req.originalUrl} not found') as any;
    err.statuscode = 404;
    next(err);

}); 