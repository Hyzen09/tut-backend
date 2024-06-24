import { asynchandeler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/coludinary.js"
import { ApiResponce } from "../utils/ApiResponce.js";
import Jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessAndRefereshToken = async (userID) => {
    try {
        const user = await User.findById(userID)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating tokens ")
    }
}

const registerUser = asynchandeler(async (req, res) => {
    // get user details from frontend.
    //validation -not empty
    //check if user already exist : through username and email
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

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "this account is already register")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;


    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar files is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath, "avatar")
    const coverImage = await uploadOnCloudinary(coverImageLocalPath, "coverImage")

    if (!avatar) {
        throw new ApiError(400, "avatar files is not uploaded correctly")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering a user")

    }

    return res.status(201).json(
        new ApiResponce(200, createdUser, "user register sucessfully")
    )
})

const loginUser = asynchandeler(async (req, res) => {

    //req body => data
    //username or email
    //find ther user 
    //passwore check
    // access and refresh token
    //send cookies
    console.log(req.user)
    const { username, email, password } = req.body
    console.log(username, email, password)
    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({ $or: [{ username }, { email }] })
    console.log("user - ", user)
    if (!user) {
        throw new ApiError(404, "user doesnot exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "enter correct password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(user._id)
    console.log("accessToken - ", accessToken, "refreshToken - ", refreshToken)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(
                200,
                {
                    user: loggedInUser,
                    accessToken, refreshToken,
                },
                "user logged in successfully",
            )
        )
})



const logOutUser = asynchandeler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,

            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponce(200, {}, "User logged out"))
})

const refreshTokenAccess = asynchandeler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
        if (!incomingRefreshToken) {
            throw new ApiError(401, "unAuthorize request")
        }

        const decodedRefreshToken = Jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedRefreshToken?._id)
        if (!user) {
            throw new ApiError(401, "unAuthorize Refresh token")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired or user")
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefereshToken(user._id)
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponce(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "access token refreshed"
            ))


    } catch (error) {
        throw new ApiError(401, "invalid refresh token")
    }
})

const changeCurrentPassword = asynchandeler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(401, "password is incorrect")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: fales })
    return res.status(200).json(new ApiResponce(200, {}, "password changed successfully"))

})

const getCurrentUser = asynchandeler(async (req, res) => {
    // const user = await User.findById(req.user?._id)
    return res
        .status(200)
        .json(new ApiResponce(200, req.user, "current user"))

})
const updateAccountDetails = asynchandeler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new ApiError(200, "all fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname: fullname,
                email: email
            }
        },
        {
            new: true,
        }
    ).select("-password")
    return res
        .status(200)
        .json(200, { user }, "account detail updated successfully")
})

const updateUserAvatar = asynchandeler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        new ApiError(400, "avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, 'error while uploading avatar')
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponce(200, user, "avater changed successfully"))

})
const updateUserCoverImage = asynchandeler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        new ApiError(400, "cover image file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400, 'error while uploading coverimage')
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(new ApiResponce(200, user, "cover image changed successfully"))

})

//-------study this again block--------
const getUserChannelProfile = asynchandeler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }
    const channel = await User.aggregate([{
        $match: {
            username: username?.toLowerCase()
        }
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        }
    },
    {
        $addFields: {
            subscribersCount: {
                $size: "subscribers"
            },
            channelsSubscribedToCount: {
                $size: "subscribedTo"
            },
            isSubscribed: {
                $cond: {
                    if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                    then: true,
                    else: false

                }
            }

        }
    },
    {
        $project: {
            fullname: 1,
            username: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1,

        }
    }
    ])
    if (!channel?.length) {
        throw new ApiError(404, "channel doesnot exists")
    }
    console.log(channel)

    return res
        .status(200)
        .json(new ApiResponce(200, channel[0], "User channel feched successfully"))

})


const getWatchHistory = asynchandeler(async (req, res) => {
    const user = User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res
        .status(200)
        .json(new ApiResponce(200, user[0].watchHistory, "feched history"))
})
export {
    registerUser,
    loginUser,
    logOutUser,
    refreshTokenAccess,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}  