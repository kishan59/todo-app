import mongoose from "mongoose";

const priorityEnum = ['low', 'medium', 'high'];

const taskSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required.']
    },
    description: {
        type: String,
        default: null
    },
    due_date: {
        type: Date,
        required: [true, 'Due date is required.']
    },
    priority: {
        type: String,
        enum: priorityEnum,
        default: 'medium'
    },
    status: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    }
}, {
    timestamps: true
});

const Task = mongoose.Model('Task', taskSchema);

export default Task;