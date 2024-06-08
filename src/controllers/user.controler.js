import router from "../routes/user.routes.js";
import { asynchandeler } from "../utils/asyncHandeler.js";

const registerUser = asynchandeler(async (req, res) => {
    res.status(200).json({
        message: 'OK'
    })
})

export { registerUser }   