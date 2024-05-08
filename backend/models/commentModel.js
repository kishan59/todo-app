import mongoose from 'mongoose';

// comments
const commentSchema = mongoose.Schema({
    tasktId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment_text: {
        type: String,
        required: [true, 'Comment is required.']
    }
}, {
    timestamps: true
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;