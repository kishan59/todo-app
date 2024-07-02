import asyncHandler from "express-async-handler";
import Task from "../models/taskModel.js";

const getTaskList = asyncHandler(async (req, res) => {
    let tasks = [];
    const { _id } = req.user;
    const { type } = req.query;
    const limit = req.query.limit || 0;
    const page = req.query.page || 1;
    const offset = req.query.page || req.query.limit ? (page - 1) * limit : 0;
    
    const { due_date, categoryId, title, priority } = req.query;
    const searchFilters = {
        // due_date: due_date || undefined, 
        // categoryId: categoryId || undefined,
        // title: title ? new RegExp(title, 'i') : undefined, 
        // priority: priority || undefined 
        ...(due_date && { due_date }),
        ...(categoryId && { categoryId }),
        ...(title && { title: new RegExp(title, 'i') }),
        ...(priority && { priority }),
    }

    if(type == 'overdue'){
        delete searchFilters.due_date;
        if(!due_date){
            res.status(400);
            throw new Error('Date is not provided.');
        }
        tasks = await Task.find({ status: false, userId: _id, due_date: { $lt: due_date }, ...searchFilters })
                            .sort({ 'order.dayOrder': -1 }).skip(offset).limit(limit);
    }else if(type == 'today' || type == 'upcoming') {
        delete searchFilters.due_date;
        if(!due_date){
            res.status(400);
            throw new Error('Date is not provided.');
        }
        tasks = await Task.find({ status: false, userId: _id, due_date: due_date, ...searchFilters })
                            .sort({ 'order.dayOrder': -1 }).skip(offset).limit(limit);
    }else if(type == 'category') {
        delete searchFilters.categoryId;
        if(!categoryId){
            res.status(400);
            throw new Error('Category Id is not provided.');
        }
        tasks = await Task.find({ status: false, $or: [{ userId: _id }, { assigned_to: _id }], categoryId, ...searchFilters })
                            .sort({ 'order.categoryOrder': -1 }).skip(offset).limit(limit);
    }else{
        tasks = await Task.find({ status: false, userId: _id, ...searchFilters })
                            .sort({ 'createdAt': -1 }).skip(offset).limit(limit);
    }
    
    res.status(200).json({data: tasks});
});


const getCompletedTaskList = asyncHandler(async (req, res) => {
    // give the total tasks for (given type) and total done task for (given type)
        // where (given type) can be today or this week or this month or specific start and end dates period, so we can show completed tasks summary
})


const createTask = asyncHandler(async (req, res, next) => {
    try {
        const { _id } = req.user;
        let body = req.body;
        body = {...body, userId: _id, assigned_to: body.assigned_to || _id};
        let due_date_order, category_order;
        const check_due_date = new Date(body.due_date || "");
        if(body.due_date && (check_due_date instanceof Date && !isNaN(check_due_date))){
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
        const savedTask = await Task.create(body);
        let { filters = {} } = req.body;
        if(filters.type) { delete filters['type']; }
        const task = await Task.findOne({ _id: savedTask._id, status: false, userId: _id, ...filters });
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


const editTask = asyncHandler(async (req, res, next) => {
    const { _id } = req.user;
    const { id } = req.params;
    let body = req.body;
    body = {...body, userId: _id, assigned_to: body.assigned_to || _id};
    const task = await Task.findOne({ status: false, _id: id });
    if(task){
        let reorderOperations = [];
        let due_date_order = task.order.dayOrder;
        let category_order = task.order.categoryOrder;
        const check_due_date = new Date(body.due_date || "");
        if(body.due_date && (check_due_date instanceof Date && !isNaN(check_due_date)) && body.due_date != task.due_date.toISOString()){
            const getLatestDayOrder = await Task.findOne({ status: false, due_date: body.due_date }).sort({ 'order.dayOrder':  -1 });
            due_date_order = getLatestDayOrder?.order.dayOrder ? Number(getLatestDayOrder.order.dayOrder) + 1 : 1;
            
            // reordering all the task that this current task belongs to, to keep the order
            const dueDateTasks = await Task.find({ status: false, due_date: task.due_date, _id: { $ne: id } }).sort({ 'order.dayOrder':  1 });
            const reorder_dueDateTasks = dueDateTasks.map((task, idx) => ({
                updateOne: {
                    filter: { _id: task._id },
                    update: { $set: { 'order.dayOrder': idx + 1 } }
                }
            }));
            reorderOperations = [...reorderOperations, ...reorder_dueDateTasks];
        }
        if(body.categoryId && body.categoryId != task.categoryId){
            const getLatestDayOrder = await Task.findOne({ status: false, categoryId: body.categoryId }).sort({ 'order.categoryOrder':  -1 });
            category_order = getLatestDayOrder?.order.categoryOrder ? Number(getLatestDayOrder.order.categoryOrder) + 1 : 1;
            
            // reordering all the task that this current task belongs to, to keep the order
            const categoryTasks = await Task.find({ status: false, categoryId: task.categoryId, _id: { $ne: id } }).sort({ 'order.categoryOrder': 1 });
            const reorder_categoryTasks = categoryTasks.map((task, idx) => ({
                updateOne: {
                    filter: { _id: task._id },
                    update: { $set: { 'order.categoryOrder': idx + 1 } }
                }
            }));
            reorderOperations = [...reorderOperations, ...reorder_categoryTasks]
        }

        let order = {
            dayOrder: due_date_order,
            categoryOrder: category_order,
        };
        body = {...body, order}
        try {
            task.set(body);
            const savedTask = await task.save();
            if(savedTask){
                const result = await Task.bulkWrite(reorderOperations);
            }
            let { filters = {} } = req.body;
            if(filters.type) { delete filters['type']; }
            const updatedTask = await Task.findOne({ _id: savedTask._id, status: false, userId: _id, ...filters });
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
    const task = await Task.findOne({ status:false, _id: id });
    if(task){
        let reorderOperations = [];
        if(task.due_date){
            // reordering all the task that this current task belongs to, to keep the order
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
            // reordering all the task that this current task belongs to, to keep the order
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


const completeTask = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const task = await Task.findOne({ status: false, _id: id });
    if(task){
        let reorderOperations = [];
        if(task.due_date){
            // reordering all the task that this current task belongs to, to keep the order
            const dueDateTasks = await Task.find({ status: false, due_date: task.due_date, _id: { $ne : id } }).sort({ 'order.dayOrder': 1 });
            const reorder_dueDateTasks = dueDateTasks.map((task, idx) => ({
                updateOne: {
                    filter: { _id: task._id },
                    update: { $set: { 'order.dayOrder': idx + 1 } }
                }
            }));
            reorderOperations = [...reorderOperations, ...reorder_dueDateTasks];
        }

        if(task.categoryId){
            // reordering all the task that this current task belongs to, to keep the order
            const categoryTasks = await Task.find({ status: false, categoryId: task.categoryId, _id: { $ne: id } }).sort({ 'order.categoryOrder': 1 });
            const reorder_categoryTasks = categoryTasks.map((task, idx) => ({
                updateOne: {
                    filter: { _id: task._id },
                    update: { $set: { 'order.categoryOrder': idx + 1 } }
                }
            }));
            reorderOperations = [...reorderOperations, ...reorder_categoryTasks];
        }
        try {
            task.set({status: true, order: {}});
            const completedTask = await task.save();
            if(completedTask){
                const result = await Task.bulkWrite(reorderOperations);
            }
            res.status(200).json({message: 'Task marked as completed.'});
        } catch (err) {
            next(err);
        }
    }else{
        res.status(404);
        throw new Error('Task not found.');
    }
})

// type = 'dayOrder' or 'categoryOrder'
// for e.x. taskOrders = [0005544dawdw, dawbkabk0000, dawbdkwabdkbakb]
const reorderTask = asyncHandler(async (req, res, next) => {
    let { orderType, taskOrders } = req.body;
    if(orderType && taskOrders && taskOrders.length !== 0){
        const orderKey = `order.${orderType}`; 
        const reorderOperations = taskOrders.map((taskId, idx) => ({
            updateOne: {
                filter: { _id: taskId },
                update: { $set: { [orderKey]: taskOrders.length - idx } }
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


export { getTaskList, createTask, editTask, deleteTask, completeTask, reorderTask };