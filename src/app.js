import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

//settings...
// configure CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

//configuring API , setting api size limit
app.use(express.json({
    limit: "16kb",
}))

// telling express that get ready to take data from URL(Url rewritting) 
app.use(express.urlencoded({
    extended: true,
    limit: "16kb" }))

//configering static folder
app.use(express.static("public"))

//for cookies
app.use(cookieParser())


export { app }
