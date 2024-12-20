import { Request, Response, NextFunction } from "express";
import userModel,{Iuser} from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/CatchAsyncErrors";
import path from "path";
import sendMail from "../utils/sendMail";
import ejs from 'ejs';
import jwt, { Secret } from "jsonwebtoken";
import { sendToken } from "../utils/jwt";



//for registring the user///////////////////////////////////

interface IRegistrationBody{
    name: string;
    email: string;
    password: string;
    avatar?: string;
}
export const registrationUser = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>
{
    try{
        const {name,email,password} = req.body;
        const isEmailExist = await userModel.findOne({email});
        if(isEmailExist){
            return next(new ErrorHandler("email exist",400));

        };
        const user: IRegistrationBody = {
            name,
            email,
            password,
        };
        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode;

        const data = {user: {name: user.name},activationCode};
        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"),data);

        try{
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                template: "activation-mail.ejs",
                data,
            });
        
        res.status(201).json({
            success: true,
            message: 'Please check your email: ${user.email} to activate your email',
            activationToken: activationToken.token,
        });
    }
        catch (error:any){
            return next(new ErrorHandler(error.message,400))
        }

    }
    catch(error:any){
        return next(new ErrorHandler(error.message,400))
    }
})

interface IActivationToken{
    token: string;
    activationCode: string;
}
export const createActivationToken = (user:any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign(
        {
            user,activationCode,
        },
        process.env.ACTIVATION_SECRET as Secret,{
            expiresIn: "5m",
        }
        
    );

    return {token, activationCode};
}

/////////////////////////// ACTIVATING THE USER ////////////////////////////////


interface IActivationRequest{
    activation_token: string;
    activation_code: string;

}

export const activateUser = CatchAsyncError(async(req:Request, res:Response, next: NextFunction)=>{
    try{
        const{ activation_token,activation_code} = req.body as IActivationRequest;

        const newUser: {user: Iuser; activationCode: string} = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
    ) as {user: Iuser; activationCode:string};
    
    if(newUser.activationCode !== activation_code){
        return next(new ErrorHandler("Invalid activationcode",400));
    }

    const {name,email,password} = newUser.user;
    const existUser = await userModel.findOne({email});

    if(existUser){
        return next(new ErrorHandler("email already exist",400));
    }
    
    const user = await userModel.create({
        name,
        password,
        email,
    });

    res.status(201).json({
        success: true,
    });

    }
    catch(error:any){
        return next(new ErrorHandler(error.message,400));

    }
});

//////////////////////////////// Login User /////////////////////////////////

interface ILoginRequest{
    email: string;
    password: string;
}

export const loginUser = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try{
        const {email,password} = req.body as ILoginRequest;

        if(!email || !password){
            return next(new ErrorHandler("please email and password",400));
        };


        const user = await userModel.findOne({email}).select("+password"); 

        if(!user){
            return next(new ErrorHandler("invalid email and password",400))
        };

        const isPasswordMatch = await user.comparePassword(password);

        if(!isPasswordMatch){
            return next(new ErrorHandler("Invalid email of password",400));
        }
        sendToken(user,200,res);
    }
    catch(error:any){
        return next(new ErrorHandler(error.message, 400));
    }
});