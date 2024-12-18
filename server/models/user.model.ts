require('dotenv').config();
import mongoose,{ Document, Model, Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface Iuser extends Document{
    name: string;
    email: string;
    password: string;
    avatar:{
        public_id: string;
        ulr: string;
    },
    role: string;
    isVerified: boolean;
    courses: Array<{courseId: string}>;
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;


};

const userSchema: Schema<Iuser> = new mongoose.Schema({
    name:{
        type:String,
        required: [true, "please enter your name"],
    },
    email:{
        type:String,
        required: [true, "please enter your email"],
        validate: {
            validator: function (value:string){
                return emailRegexPattern.test(value);
            },
            message: "please enter valid email address",           
        },
        unique: true,

    },
    password:{
        type: String,
        required: [true, "please enter your password"],
        minlength: [6, "password must be at least 6 characters"],
        select: false,

    },
    avatar:{
        public_id: String,
        url: String,
    },
    role:{
        type:String,
        default: "user",
    },
    isVerified:{
        type: Boolean,
        default: false, 
    },
    courses:[
        {
            courseId: String,
        }
    ],
},{timestamps:true});

// hashing the password with bcrypt before saving

userSchema.pre<Iuser>('save', async function (next) {
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
    next();
});
///////////////////////////////////sign access token///////////////////////////////////

userSchema.methods.SignAccessToken = function () {
    return jwt.sign({id: this._id}, process.env.Access_Token || '');
};

///////////////////////////////////sign refresh token//////////////////////////////
userSchema.methods.SignRefreshToken = function () {
    return jwt.sign({id: this._id},process.env.Refresh_Token || ''
    );
}

// for comaparing the password schema
 
userSchema.methods.comparePassword = async function(enteredPassword:string): Promise<boolean>{
   return await bcrypt.compare(enteredPassword,this.password); 
};
const userModel: Model<Iuser> = mongoose.model("User", userSchema);

export default userModel;