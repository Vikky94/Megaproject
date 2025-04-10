import { Router } from "express";
import { registerUser,testingRoute, loginUser, logoutUser, resendEmailVerification} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegistrationValidator, userLoginValidator } from "../validators/index.js";
import { isLoggedIn } from '../middlewares/auth.middleware.js'


const router = Router();

router.route("/").get(testingRoute);
router.route("/register").post(userRegistrationValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/logout").get(isLoggedIn, logoutUser);
router.route("/resend-verification-email").get(isLoggedIn, resendEmailVerification);

export default router;
