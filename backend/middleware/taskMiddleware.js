import asyncHandler from "express-async-handler";
import Task from "../models/taskModel.js";
import Category from "../models/categoryModel.js";
import Comment from "../models/commentModel.js";

// this will only let owner or assigned_to logged in person to change or access tasks, add/edit/delete comments
const notAuthorizedTask = asyncHandler(async (req, res, next) => {
    const { id } = req.params; 
    const userId = req.user._id;
    const task = await Task.findOne({ _id: id, $or: [{ assigned_to: userId }, { userId }] });
    if(!task) {
        res.status(403);
        throw new Error('Not authorized to access this task.');
    }else{
        next();
    }
});


// this will only let owner of the category to change it
const notAuthorizedCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params; 
    const userId = req.user._id;
    const category = await Category.findOne({ userId, _id: id });
    if(!category) {
        res.status(403);
        throw new Error('Not authorized to change this category.');
    }else{
        next();
    }
});


const notAuthorizedComment = asyncHandler(async (req, res, next) => {
    const method = req.method;
    const allowedMethods = ["PUT", "PATCH", "DELETE"];
    const userId = req.user._id;
    let check, message;
    if(allowedMethods.includes(method)) {
        const { id } = req.params;
        check = await Comment.findOne({ userId, _id: id });     // owner of comment can edit/delete it
        message = 'Not authorized to change this comment.';
    }else{
        const { tasktId } = req.params;
        check = await Task.findOne({ _id: tasktId, $or: [{ assigned_to: userId }, { userId }] });
        message = 'Not authorized to access/add comments on this task.';
    }

    if(!check){
        res.status(403);
        throw new Error(message);
    }else{
        next();
    }
})

export { notAuthorizedTask, notAuthorizedCategory, notAuthorizedComment };