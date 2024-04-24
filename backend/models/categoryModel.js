// categories
import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Name is required.']
    },
    color: {
        type: String,
        required: [true, 'Color is required.']
    },
    shared_with: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
    }
}, {
    timestamps: true
});

const Category = mongoose.model('Category', categorySchema);

export default Category;