import { Router } from "express";
import {
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
} from "../controllers/user.controler.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,

        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)


router.route('/login').post(loginUser)

//secured routs
router.route('/logout').post(verifyJWT, logOutUser)
router.route('/refreshToken').post(refreshTokenAccess)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/update-account').patch(verifyJWT, updateAccountDetails)
router.route('/avatar').patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route('/coverImage').patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)


export default router 