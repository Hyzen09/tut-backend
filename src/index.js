import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})
connectDB()
//First approach to connect to database

// ;( async ()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("error: ",error)
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`listening on port ${process.env.PORT}`)
//         })
//     }
//     catch(error){
//         console.error("ERROR: ",error)
//     }
// })()
//-----------------------------------------------------------------------------

