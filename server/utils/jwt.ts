require("dotenv").config();
import  { Response } from "express";
import { Iuser } from "../models/user.model";
import { redis } from "./redis";


interface iTokenOptions{
    expires: Date;
    maxAge: number;
    httponly: boolean;
    samesite: 'lax' | 'strict' | 'none' | undefined;
    secure?:boolean;
}

export const sendToken = (user:Iuser, statuscode: number, res:Response) =>
{
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    /////////////////////////upload session on redish//////////////////////

    redis.set(String(user._id), JSON.stringify(user) as any);
    //////////////////////////parsing the tokens////////////////////////////

    const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10);
    const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '300', 10);

    //OPTION FOR COOKIES/////////////////////

    const accessTokenOptions: iTokenOptions = {

        expires: new Date(Date.now() + accessTokenExpire * 1000),
        maxAge: accessTokenExpire * 1000,
        httponly: true,
        samesite: 'lax',

    };

    const refreshTokenOptions: iTokenOptions = {

        expires: new Date(Date.now() + accessTokenExpire * 1000),
        maxAge: accessTokenExpire * 1000,
        httponly: true,
        samesite: 'lax',

    };

    // only set secure to true in production///////////
    if(process.env.NODE_ENV === 'production'){
        accessTokenOptions.secure = true;
    }
    res.cookie("access_token",accessToken,accessTokenOptions);
    res.cookie("refresh_token",refreshToken,refreshTokenOptions);
    
    res.status(statuscode).json({
        success: true,
        user,
        accessToken,
    })
}