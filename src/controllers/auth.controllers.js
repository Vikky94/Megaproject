import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { sendEmailVerificationMail } from '../utils/mail.js'
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
const testingRoute = asyncHandler(async (req, res) => {
  console.log("I am inside auth route inside Testing Route");
  res.status(200).json(new ApiResponse(200, { message: "I am auth Testing Route" }));
});

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;
  const isUserExist = await User.findOne({ $or: [{ email }, { username }] });
  if (isUserExist)
    res.status(409).json(new ApiError(409, "User Already exist..."))
  else {
    const createdUser = await User.create({
      email,
      username,
      password,
      role
    });
    if (!createdUser) res.status(400).json(new ApiError(400, "User not registered..."))

    const tokens = createdUser.generateTemporaryToken();
    createdUser.emailVerificationToken = tokens.unHashedToken;
    createdUser.emailVerificationExpiry = tokens.tokenExpiry;
    await createdUser.save();
    createdUser.hashedToken = tokens.hashedToken;
    await sendEmailVerificationMail(createdUser);
    res.status(200).json(new ApiResponse(200, "Registration successful! Welcome to MegaProject. You can now log in and start using our services. Please check your email and verify"));
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const invalidError = new ApiError(400, "Invalid Credntials...", ["Invalid Credntials..."]);

  //check if user exist
  const user = await User.findOne({ $or: [{ email }, { username }] })
  if (!user)
    res.status(400).json(invalidError);
  else {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const accessToken = user.generateAccessToken();
      user.refreshToken = user.generateRefreshToken();
      user.save();

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: process.env.JWT_COOKIE_EXPIRY
      };
      res.cookie("accessToken", accessToken, cookieOptions);
      res.cookie("refreshToken", user.refreshToken, cookieOptions);
      const { _id, avatar, username, email, isEmailVerified, emailVerificationExpiry, emailVerificationToken, refreshToken } = user;

      res.status(200).json(
        new ApiResponse(200, { "user": { _id, avatar, username, email, isEmailVerified, emailVerificationExpiry, emailVerificationToken, refreshToken, accessToken } }, "Login successful"));
    }
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {

});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const invalidError = new ApiError(400, "User does not exist", ["User does not exist"]);
  const { email, username } = req.user;
  const isUserExist = await User.findOne({ $or: [{ email }, { username }] }).select('-password');
  if (!isUserExist) {
    res.status(400).json(invalidError);
  }
  const tokens = isUserExist.generateTemporaryToken();
  isUserExist.emailVerificationToken = tokens.unHashedToken;
  isUserExist.emailVerificationExpiry = tokens.tokenExpiry;
  await isUserExist.save();
  isUserExist.hashedToken = tokens.hashedToken;
  await sendEmailVerificationMail(isUserExist);
  res.status(200).json(new ApiResponse(200, "Verification email sent successfully"));
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

export {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmail,
  testingRoute
};
