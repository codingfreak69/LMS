import mongoose from 'mongoose';
require('dotenv').config();


const dbUrl:string = process.env.DB_URL || '';

const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl).then((data:any) =>{
            console.log("database connected ")
        })

    }catch (error:any){
        console.log(error.message);
        console.log(connectDB, 4000);
    }
    
}

export default connectDB;