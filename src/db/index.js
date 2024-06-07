import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        const connectionEnstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`monogoDB connected !! DB host: ${connectionEnstance.connection.host}`)
    }catch(error){
        console.log("MONGODB connection Faild: ",error);
        process.exit(1) // this you have to study on your own
    }
}

export default connectDB