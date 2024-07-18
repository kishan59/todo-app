import asyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js";

const getCategoryList = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const limit = req.query.limit || 0;
    const page = req.query.page || 1;
    const offset = req.query.page || req.query.limit ? (page - 1) * limit : 0;
    
    const { name } = req.query;
    const searchFilters = {
        ...(name && { name }),
    }

    const categories = await Category.find({ $or: [{userId: _id}, {shared_with: { $in: [_id] }}], ...searchFilters })

    res.status(200).json({data: categories});
});


const createCategory = asyncHandler(async (req, res) => {
    try {
        let body = req.body;
        body.color = body.color || '#808080'
        const result = await Category.create(body);
        res.status(200).json({message: 'Category created successfully.', data: result});
    } catch (err) {
        if(err.name === 'ValidationError' && err.errors) {
            const errors = Object.keys(err.errors).reduce((acc, key) => {
                acc[key] = err.errors[key].message;
                return acc;
            }, {});
            
            res.status(400).json({message: "Invalid category data.", errors});
        }else{
            next(err);
        }
    }
})


export { getCategoryList, createCategory };
