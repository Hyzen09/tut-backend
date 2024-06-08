import router from "../routes/user.routes.js";
import { asynchandeler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uplodeOnCloudinary } from "../utils/coludinary.js"
import { ApiResponce } from "../utils/ApiResponce.js";
const registerUser = asynchandeler(async (req, res) => {
    // get user details from frontend.
    //validation -not empty
    //check if user already exist : through sername and email
    //check for images , check for avatar
    // upload them to cloudinary , avatar check
    //creat user object - create entry im db
    //remove password and refresh token field from responce
    //check for user creation 
    // return responce

    const { username, email, fullname, password } = req.body
    console.log("email", email);

    if (
        [username, email, fullname, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "all fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw ApiError(409, "this account is already register")
    }

    const avatarLocalPath = req.filse?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar files is required")
    }

    const avatar = await uplodeOnCloudinary(avatarLocalPath)
    const coverImage = await uplodeOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "avatar files is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser  = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500 , "something went wrong while registering a user")
        
    }

    return res.status(201).json(
        new ApiResponce(200, createdUser,"user register sucessfully")
    )
})

export { registerUser }    