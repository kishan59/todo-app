import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

const registerUser = asyncHandler(async (req, res, next) => {
    const { username, email, password, confirmPassword } = req.body;

    if(password && password !== confirmPassword){
        const error = new Error('Password and confirm password do not match.');
        error.statusCode = 400;
        throw error;
    }
    const userExist = await User.findOne({email});
    if(userExist) {
        res.status(400);
        throw new Error('User already exist.');
    }
    try{
        const user = await User.create({
            username, email, password
        });

        generateToken(res, user._id);
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email
        });
    }catch(err) {
        if(err.name === 'ValidationError' && err.errors){
            const errors = Object.keys(err.errors).reduce((acc, key) => {
                acc[key] = err.errors[key].message;
                return acc;
            }, {});

            res.status(400).json({message: "Invalid user data.", errors});
        }else{
            next(err);
        }
    }

    return res.status(200).json({message: "User registered successfully."});
});


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({email});
    if(user && (await user.matchPassword(password))) {  // if user found and calling passwordmatching method from schema return also true
        generateToken(res, user._id);
        res.status(200).json({
            _id: user._id,
            email: user.email,
            username: user.username
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password.');
    }
});


const logoutUser = asyncHandler(async (req, res) => {
    // removing/expiring immediately the jwt token from cookies
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({message: 'User logged out successfully.'});
});


const getUserProfile = asyncHandler(async (req, res) => {
    const user = {
        _id: req.user._id, 
        email: req.user.email, 
        username: req.user.username
    }      // protect middleware will push all user data into req.user so we can just return this as response
    res.status(200).json(user);
});


const updateUserProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, password, username } = req.body;

    const user = await User.findById(id);
    if(user) {
        try {
            user.email = email;
            user.username = username;
            if(password){
                user.password = password;
            }
            const updatedUser = await user.save();
            res.status(200).json({
                _id: updatedUser._id,
                email: updatedUser.email,
                username: updatedUser.username,
            });
        } catch (err) {
            if(err.name === 'ValidationError' && err.errors) {
                const errors = Object.keys(err.errors).reduce((acc, key) => {
                    acc[key] = err.errors[key].message;
                    return acc;
                }, {});

                res.status(400).json({message: "Invalid user data.", errors})
            }else{
                next(err);
            }
        }
    }else {
        res.status(404);
        throw new Error('User not found');
    }  

});


const getUsersList = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    const users = await User.find({ _id: { $ne: _id } });
    res.status(200).json({data: users});
})


export { registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile, getUsersList };