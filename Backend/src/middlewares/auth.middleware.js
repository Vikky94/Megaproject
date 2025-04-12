import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

export const isLoggedIn = asyncHandler( async(req, res, next) => {
  const authErrorObj = new ApiError(401, "Authentication failed");
  console.log(req.cookies);
  let accessToken = req.cookies?.accessToken;
  console.log("Token Found: ", accessToken ? "YES" : "NO");
  if (!accessToken) {
    console.log("NO token");
    throw new authErrorObj;
  }
  const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  if( !decoded ) throw new authErrorObj;
  console.log("decoded data: ", decoded);
  req.user = decoded;
  next();
})
