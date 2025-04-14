import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

export const isLoggedIn = asyncHandler( async(req, res, next) => {
  console.log(req.cookies);
  let accessToken = req.cookies?.accessToken;
  console.log("Token Found: ", accessToken ? "YES" : "NO");
  if (!accessToken) {
    console.log("NO token");
    throw new ApiError(400, "Access token is missing.");
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if( !decoded ) throw new ApiError(401, "Authentication failed");
    console.log("decoded data: ", decoded);
    req.user = decoded;
    next();
  } catch(err) {
    // console.log('Error while decoding accessToken', err);
    throw new ApiError(401, "Invalid or expired token.");
  }
  
})

export const validateRefreshToken = asyncHandler( async(req, res, next) => {
  const authErrorObj = new ApiError(401, "Refresh Token expired");
  console.log(req.cookies);
  let refreshToken = req.cookies?.refreshToken;
  console.log("Token Found: ", refreshToken ? "YES" : "NO");
  if (!refreshToken) {
    console.log("NO token");
    throw new authErrorObj;
  }
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  if( !decoded ) throw new authErrorObj;
  console.log("decoded data: ", decoded);
  req.user = decoded;
  next();
})
