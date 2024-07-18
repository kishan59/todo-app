import  express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { completeTask, createTask, deleteTask, editTask, getTaskList, reorderTask } from '../controllers/taskController.js';
import { notAuthorizedCategory } from '../middleware/taskMiddleware.js';
import { createCategory, getCategoryList } from '../controllers/categoryController.js';

const router = express.Router();

router.route('/').get(getCategoryList);
router.route('/').post(createCategory);
// router.route('/:id').patch(notAuthorizedCategory, editCategory);
// router.route('/:id').delete(notAuthorizedCategory, deleteCategory);

export default router;