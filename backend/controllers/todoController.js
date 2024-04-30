import asyncHandler from "express-async-handler";
import Task from "../models/taskModel";

const getTaskList = asyncHandler(async (req, res) => {
    const { dueDates } = req.body;
    const tasks = await Task.find({ dueDate: { $in: dueDates } });
    if(tasks.length !== 0){
        res.status(200).json({data: tasks});
    }else {
        res.status(404);
        throw new Error('No tasks found.');
    }
});


const createTask = asyncHandler(async (req, res) => {
    try {
        const body = res.body;
        const task = await Task.create(body);
        res.status(200).json(task);
    } catch (err) {
        if(err.name === 'ValidationError' && err.errors) {
            const errors = Object.keys(err.errors).reduce((acc, key) => {
                acc[key] = err.errors[key].message;
                return acc;
            }, {});
            
            res.status(400).json({message: "Invalid task data.", errors});
        }else{
            next(err);
        }
    }
});

export { getTaskList, createTask };