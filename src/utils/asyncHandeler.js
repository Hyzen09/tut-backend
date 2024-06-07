const asynchandeler = (requsetHandeler)=>{
    (req,res,next)=>{
        Promise.resolve(requsetHandeler(req,res,next)).catch((err)=>next(err))
    }
}


export {asynchandeler}