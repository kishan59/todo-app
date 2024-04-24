import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
    let token;

    token = req.cookies.jwt;    // getting the jwt token that has userId from cookies

    if(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);      // decoding jwt token to get userId
            req.user = await User.findById(decoded.userId).select('-password');     // finding user data and passing whole object with user key into req but removing the password
            // so every time we go through this middleware all api request will have user data in req object 

            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, invalid token.');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token.');
    }
});

export { protect };