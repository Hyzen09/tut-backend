import { asynchandeler } from "../utils/asyncHandeler.js"
import  Jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";  // Ensure you have the correct import for ApiError

export const verifyJWT = asynchandeler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        console.log(req.cookies)

        if (!token) {
            throw new ApiError(401, "cannot generate token");
        }

        const decodeToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodeToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "invalid access Token");
        }

        req.user = user;
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token");
    }
})


