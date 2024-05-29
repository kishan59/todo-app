import asyncHandler from "express-async-handler";
import Task from "../models/taskModel.js";

const getTaskList = asyncHandler(async (req, res) => {
    let tasks = [];
    const { _id } = req.user;
    const { type } = req.query;
    const limit = req.query.limit || 0;
    const page = req.query.page || 1;
    const offset = req.query.page || req.query.limit ? (page - 1) * limit : 0;
    console.log("test today============>", req)

    if(type == 'overdue'){
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        tasks = await Task.find({ status: false, userId: _id, due_date: { $lt: today } })
                            .sort({ 'order.dayOrder': -1 }).skip(offset).limit(limit);
    }else if(type == 'today'){
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        tasks = await Task.find({ status: false, userId: _id, due_date: today })
                            .sort({ 'order.dayOrder': -1 }).skip(offset).limit(limit);
    }else if(type == 'upcoming') {
        const { date } = req.query;
        if(!date){
            res.status(400);
            throw new Error('Date is not provided.');
        }
        tasks = await Task.find({ status: false, userId: _id, due_date: date })
                            .sort({ 'order.dayOrder': -1 }).skip(offset).limit(limit);
    }else if(type == 'category') {
        const { categoryId } = req.query;
        if(!categoryId){
            res.status(400);
            throw new Error('Category Id is not provided.');
        }
        tasks = await Task.find({ status: false, $or: [{ userId: _id }, { assigned_to: _id }], categoryId })
                            .sort({ 'order.categoryOrder': -1 }).skip(offset).limit(limit);
    }else{
        tasks = await Task.find({ status: false, userId: _id })
                            .sort({ 'createdAt': -1 }).skip(offset).limit(limit);
    }
    
    res.status(200).json({data: tasks});
});


const getCompletedTaskList = asyncHandler(async (req, res) => {
    // give the total tasks for (given type) and total done task for (given type)
        // where (given type) can be today or this week or this month or specific start and end dates period, so we can show completed tasks summary
})


const createTask = asyncHandler(async (req, res) => {
    try {
        let body = req.body;
        const { filter } = req.body; 
        if(filter){
            delete body['filter'];
        }
        let due_date_order, category_order;
        if(body.due_date){
            const getLatestDayOrder = await Task.findOne({ status: false, due_date: body.due_date }).sort({ 'order.dayOrder':  -1 });
            due_date_order = getLatestDayOrder?.order.dayOrder ? Number(getLatestDayOrder.order.dayOrder) + 1 : 1;
        }
        if(body.categoryId){
            const getLatestCategoryOrder = await Task.findOne({ status: false, categoryId: body.categoryId }).sort({ 'order.categoryOrder':  -1 });
            category_order = getLatestCategoryOrder?.order.categoryOrder ? Number(getLatestCategoryOrder.order.categoryOrder) + 1 : 1;
        }
        let order = {
            dayOrder: due_date_order,
            categoryOrder: category_order,
        };
        body = {...body, order}
        let task = await Task.create(body);
        if(filter && Object.keys(filter).length != 0){
            task = await Task.find({ status: false, userId: task._id, ...filter });
        }
        res.status(200).json({message: 'Task created successfully.', data: task || null});
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
    const { filter } = req.body; 
    if(filter){
        delete body['filter'];
    }
    const task = await Task.find({ status: false, _id: id });
    if(task){
        let due_date_order = task.order.dayOrder;
        let category_order = task.order.categoryOrder;
        if(body.due_date && body.due_date != task.due_date){
            const getLatestDayOrder = await Task.findOne({ status: false, due_date: body.due_date }).sort({ 'order.dayOrder':  -1 });
            due_date_order = getLatestDayOrder?.order.dayOrder ? Number(getLatestDayOrder.order.dayOrder) + 1 : 1;
        }
        if(body.categoryId && body.categoryId != task.categoryId){
            const getLatestDayOrder = await Task.findOne({ status: false, categoryId: body.categoryId }).sort({ 'order.categoryOrder':  -1 });
            category_order = getLatestDayOrder?.order.categoryOrder ? Number(getLatestDayOrder.order.categoryOrder) + 1 : 1;
        }
        let order = {
            dayOrder: due_date_order,
            categoryOrder: category_order,
        };
        body = {...body, order}
        try {
            task.set(body);
            let updatedTask = await task.save();
            if(filter && Object.keys(filter).length != 0){
                updatedTask = await Task.find({ status: false, userId: updatedTask._id, ...filter });
            }
            res.status(200).json({message: 'Task updated successfully.', data: updatedTask || null});
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
    const task = await Task.find({ status:false, _id: id });
    if(task){
        let reorderOperations = [];
        if(task.due_date){
            const dueDateTasks = await Task.find({ status: false, due_date: task.due_date, _id: { $ne: id } }).sort({ 'order.dayOrder':  1 });
            const reorder_dueDateTasks = dueDateTasks.map((task, idx) => ({
                updateOne: {
                    filter: { _id: task._id },
                    update: { $set: { 'order.dayOrder': idx + 1 } }
                }
            }));
            reorderOperations = [...reorderOperations, ...reorder_dueDateTasks];
        }
        if(task.categoryId){
            const categoryTasks = await Task.find({ status: false, categoryId: task.categoryId, _id: { $ne: id } }).sort({ 'order.categoryOrder': 1 });
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


export { getTaskList, createTask, editTask, deleteTask, reorderTask };