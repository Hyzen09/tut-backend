import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path: './.env'
})

app.on('error',(error)=>{
    console.log("something not right :",error);
    throw error;
})
connectDB()
    .then(() => {
        const port = process.env.PORT
        app.listen(port || 8000, () => {
            console.log(`server is running at http://localhost:${port}`)
        })
    })
    .catch((err) => {
        console.log(`an error has occer while connecting to the database : ${err}`)
    })