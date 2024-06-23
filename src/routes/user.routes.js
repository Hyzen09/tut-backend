import { Router } from "express";
import { registerUser, loginUser, logOutUser, refreshTokenAccess } from "../controllers/user.controler.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { chechCookies } from "../middlewares/test.middleware.js";

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
export default router 