import { asynchandeler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js"
    export const chechCookies = asynchandeler(async(req,res,next)=>{
    try{
        const cookies = req.cookies
        console.log("cookies are -")
        console.log(cookies)
        next()
    }   
    catch(error){
        throw new ApiError(500,"cookies not found")
    }
})
