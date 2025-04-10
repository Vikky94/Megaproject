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
    return res.status(401).json(authErrorObj);
  }

  const decoded = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  console.log("decoded data: ", decoded);
  req.user = decoded;
  next();
})
