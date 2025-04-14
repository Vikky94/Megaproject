import { Router } from "express";
import { registerUser,testingRoute, loginUser, logoutUser, resendEmailVerification, verifyEmail, forgotPasswordRequest, resetForgottenPassword, 
    changeCurrentPassword, getCurrentUser, refreshAccessToken} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegistrationValidator, userLoginValidator,userForgotPasswordValidator,userResetForgottenPasswordValidator, userChangeCurrentPasswordValidator} from "../validators/index.js";
import { isLoggedIn, validateRefreshToken } from '../middlewares/auth.middleware.js'


const router = Router();

router.route("/").get(testingRoute);
router.route("/register").post(userRegistrationValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/logout").get(isLoggedIn, logoutUser);
router.route("/resend-verification-email").get(isLoggedIn, resendEmailVerification);
router.route("/verify-email/:token").get(verifyEmail);
router.route("/forgot-password").post(userForgotPasswordValidator(),validate,forgotPasswordRequest);
router.route("/reset-password/:token").post(userResetForgottenPasswordValidator(),validate,resetForgottenPassword);
router.route("/change-password").post(isLoggedIn,userChangeCurrentPasswordValidator(),validate,changeCurrentPassword);
router.route("/get-profile").get(isLoggedIn,getCurrentUser);
router.route("/refresh-token").get(validateRefreshToken, refreshAccessToken);

export default router;
