import asyncHandler from "express-async-handler";
import Task from "../models/taskModel.js";

const getAllTaskList = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const tasks = await Task.find({ userId: _id }).sort({'createdAt': -1});
    if(tasks.length !== 0){
        res.status(200).json({data: tasks});
    }else {
        res.status(404);
        throw new Error('No tasks found.');
    }
});


const getTodayTaskList = asyncHandler(async (req, res) => {
    // { dueDate: { $in: dueDates } }
})


const createTask = asyncHandler(async (req, res) => {
    try {
        let body = req.body;
        let due_date_order, category_order;
        if(body.due_date){
            const getLatestDayOrder = await Task.findOne({ due_date: body.due_date }).sort({ 'order.dayOrder':  -1 });
            due_date_order = getLatestDayOrder?.order.dayOrder ? Number(getLatestDayOrder.order.dayOrder) + 1 : 1;
        }
        if(body.categoryId){
            const getLatestCategoryOrder = await Task.findOne({ categoryId: body.categoryId }).sort({ 'order.categoryOrder':  -1 });
            category_order = getLatestCategoryOrder?.order.categoryOrder ? Number(getLatestCategoryOrder.order.categoryOrder) + 1 : 1;
        }
        let order = {
            dayOrder: due_date_order,
            categoryOrder: category_order,
        };
        body = {...body, order}
        const task = await Task.create(body);
        res.status(200).json({message: 'Task created successfully.', data: task});
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


const editTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let body = req.body;
    const task = await Task.findById(id);
    if(task){
        let due_date_order, category_order;
        if(body.due_date && body.due_date != task.due_date){
            const getLatestDayOrder = await Task.findOne({ due_date: body.due_date }).sort({ 'order.dayOrder':  -1 });
            due_date_order = getLatestDayOrder?.order.dayOrder ? Number(getLatestDayOrder.order.dayOrder) + 1 : 1;
        }
        if(body.categoryId && body.categoryId != task.categoryId){
            const getLatestDayOrder = await Task.findOne({ categoryId: body.categoryId }).sort({ 'order.categoryOrder':  -1 });
            category_order = getLatestDayOrder?.order.categoryOrder ? Number(getLatestDayOrder.order.categoryOrder) + 1 : 1;
        }
        let order = {
            dayOrder: due_date_order,
            categoryOrder: category_order,
        };
        body = {...body, order}
        try {
            task.set(body);
            const updatedTask = await task.save();
            res.status(200).json({message: 'Task updated successfully.', data: updatedTask});
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
    }else{
        res.status(404);
        throw new Error('Task not found.');
    }
});


// when we delete task we need to reorder the related data, for e.x. if we delete category's task the reorder all those data 
    // we then need to find the task check dayOrder and categoryOrder and then find related tasks and reorder the whole tasks we found
const deleteTask = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const task = await Task.findById(id);
    if(task){
        let reorderOperations = [];
        if(task.due_date){
            const dueDateTasks = await Task.find({ due_date: task.due_date, _id: { $ne: id } }).sort({ 'order.dayOrder':  1 });
            const reorder_dueDateTasks = dueDateTasks.map((task, idx) => ({
                updateOne: {
                    filter: { _id: task._id },
                    update: { $set: { 'order.dayOrder': idx + 1 } }
                }
            }));
            reorderOperations = [...reorderOperations, ...reorder_dueDateTasks];
        }
        if(task.categoryId){
            const categoryTasks = await Task.find({ categoryId: task.categoryId, _id: { $ne: id } }).sort({ 'order.categoryOrder': 1 });
            const reorder_categoryTasks = categoryTasks.map((task, idx) => ({
                updateOne: {
                    filter: { _id: task._id },
                    update: { $set: { 'order.categoryOrder': idx + 1 } }
                }
            }));
            reorderOperations = [...reorderOperations, ...reorder_categoryTasks]
        }
        try {
            const deleteTask = await Task.findByIdAndDelete(id);
            if(deleteTask){
                const result = await Task.bulkWrite(reorderOperations);
            }
            res.status(200).json({message: 'Task deleted successfully.'});
        } catch (err) {
            next(err);
        }
    }else{
        res.status(404);
        throw new Error('Task not found.');
    }
});


// type = 'dayOrder' or 'categoryOrder'
// for e.x. taskOrders = {0005544dawdw: 1, dawbkabk0000: 2, dawbdkwabdkbakb: 3}
const reorderTask = asyncHandler(async (req, res, next) => {
    let { type, taskOrders } = req.body;
    if(type && taskOrders){
        taskOrders = JSON.parse(taskOrders);
        const orderKey = `order.${type}`; 
        const reorderOperations = Object.keys(taskOrders).map((taskId, idx) => ({
            updateOne: {
                filter: { _id: taskId },
                update: { $set: { [orderKey]: taskOrders[taskId] } }
            }
        }));
        try {
           const result = await Task.bulkWrite(reorderOperations);
           res.status(200).json({message: 'Task reordered successfully.' })
        } catch (err) {
            next(err);
        }
    }else{
        res.status(400);
        throw new Error('Type or Task reorder data is missing.');
    }
});


export { getAllTaskList, getTodayTaskList, createTask, editTask, deleteTask, reorderTask };