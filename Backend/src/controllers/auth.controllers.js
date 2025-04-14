import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { sendEmailFor } from '../utils/mail.js'
import bcrypt from "bcryptjs";
import crypto from "crypto";
const testingRoute = asyncHandler(async (req, res) => {
  console.log("I am inside auth route inside Testing Route");
  res.status(200).json(new ApiResponse(200, { message: "I am auth Testing Route" }));
});

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;
  const isUserExist = await User.findOne({ $or: [{ email }, { username }] });
  if (isUserExist)
    throw new ApiError(409, "User Already exist...")
  else {
    const createdUser = await User.create({
      email,
      username,
      password,
      role
    });
    if (!createdUser) throw new ApiError(400, "User not registered...")

    const tokens = createdUser.generateTemporaryToken();
    createdUser.emailVerificationToken = tokens.hashedToken;
    createdUser.emailVerificationExpiry = tokens.tokenExpiry;
    await createdUser.save();
    createdUser.unHashedToken = tokens.unHashedToken;
    await sendEmailFor("emailVerfication", createdUser);
    res.status(200).json(new ApiResponse(200, "User registered successfully. Please check your email and verify."));
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  //check if user exist
  const user = await User.findOne({ $or: [{ email }, { username }] })
  if (!user)
    throw new ApiError(400, "Invalid Credntials...");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(400, "Invalid Credntials...");
  const accessToken = user.generateAccessToken();
  user.refreshToken = user.generateRefreshToken();
  await user.save();

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: process.env.JWT_COOKIE_EXPIRY
  };
  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", user.refreshToken, cookieOptions);
  const { _id, avatar,isEmailVerified, emailVerificationExpiry, emailVerificationToken, refreshToken } = user;

  res.status(200).json(
    new ApiResponse(200, { "user": { _id, avatar, username, email, isEmailVerified, emailVerificationExpiry, emailVerificationToken, refreshToken, accessToken } }, "Login successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  console.log(req);
  if (!req.params && !req.params.token)
    throw new ApiError(400, 'Invalid token');

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const isDataExist = await User.findOne({ $and: [{ emailVerificationToken: hashedToken }, { emailVerificationExpiry: { $gt: new Date() } }] });
  if (!isDataExist)
    throw new ApiError(400, 'Token is expired...');

  isDataExist.emailVerificationToken = null;
  isDataExist.emailVerificationExpiry = null;
  isDataExist.isEmailVerified = true;
  await isDataExist.save();
  res.status(200).json(new ApiResponse(200, "Email verified successfully."));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email, username } = req.user;
  const isUserExist = await User.findOne({ $or: [{ email }, { username }] }).select('-password');
  if (!isUserExist) throw new ApiError(400, "User not found.");

  const tokens = isUserExist.generateTemporaryToken();
  isUserExist.emailVerificationToken = tokens.hashedToken;
  isUserExist.emailVerificationExpiry = tokens.tokenExpiry;
  isUserExist.isEmailVerified = false;
  await isUserExist.save();
  isUserExist.unHashedToken = tokens.unHashedToken;
  await sendEmailFor("emailVerfication", isUserExist);
  res.status(200).json(new ApiResponse(200, "Verification email sent successfully."));
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  console.log(`Reached on Auth resetForgottenPassword method`);
  const { newPassword, confirmPassword } = req.body;
  if (!req.params.token)
    throw new ApiError(400, "Invalid token")

  if (newPassword !== confirmPassword)
    throw new ApiError(400, "Passwords do not match")

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const isDataExist = await User.findOne({ $and: [{ forgotPasswordToken: hashedToken }, { forgotPasswordExpiry: { $gt: new Date() } }] });

  if (!isDataExist) throw new ApiError(400, 'Token is expired...')
  isDataExist.password = newPassword;
  isDataExist.forgotPasswordToken = null;
  isDataExist.forgotPasswordExpiry = null;
  await isDataExist.save();
  res.status(200).json(new ApiResponse(200, "Password successfully changed."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  console.log('reached in RefreshToken');
  const { _id } = req.user;
  if (!_id)
    throw new ApiError(401, "Invalid Refresh Token")

  const user = await User.findById(_id);
  if (!user) throw new ApiError(401, "User not found.")


  const accessToken = user.generateAccessToken();
  user.refreshToken = user.generateRefreshToken();
  await user.save();

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: process.env.JWT_COOKIE_EXPIRY
  };
  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", user.refreshToken, cookieOptions);

  res.status(200).json(new ApiResponse(200, "Access token refreshed successfully."));
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Invalid Email")
  const isUserExist = await User.findOne({ email: email });
  if (!isUserExist)
    throw new ApiError(400, "User not found....")

  const { unHashedToken, hashedToken, tokenExpiry } = isUserExist.generateTemporaryToken();
  isUserExist.forgotPasswordToken = hashedToken;
  isUserExist.forgotPasswordExpiry = tokenExpiry;
  await isUserExist.save();
  isUserExist.unHashedToken = unHashedToken;
  await sendEmailFor("forgotPassword", isUserExist);
  res.status(200).json(new ApiResponse(200, "Password reset link sent to your email."));

});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const { email, username } = req.user;

  if (oldPassword && newPassword !== confirmPassword)
    throw new ApiError(400, 'Password does not match')

  const isUserExist = await User.findOne({ $or: [{ email }, { username }] });
  if (!isUserExist)
    throw new ApiError(400, 'User not found.')
  const isPasswordCorrect = await isUserExist.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiError(400, 'Old Password is not correct');

  isUserExist.password = newPassword;
  await isUserExist.save();
  res.status(200).json(new ApiResponse(200, "Password reset successfully."))
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const { email, username } = req.user;
  const isUserExist = await User.findOne({ $or: [{ email }, { username }] }).select('-password');
  if (!isUserExist)
    throw new ApiError(400, 'User not found.');

  res.status(200).json(new ApiResponse(200, { user: isUserExist }));
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
