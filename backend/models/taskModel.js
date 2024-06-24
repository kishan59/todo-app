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
        required: [true, 'Enter valid due date.'],
        set: (value) => {
            const date = new Date(value || "");
            return date instanceof Date && !isNaN(date) ? value : null;
        }
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
    },
    order: {
        dayOrder: { type: Number, required: false, default: undefined }, // Order based on due date view
        categoryOrder: { type: Number, required: false, default: undefined }, // Order based on category ID view
    },
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

export default Task;