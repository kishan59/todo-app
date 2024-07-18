import  express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { completeTask, createTask, deleteTask, editTask, getTaskList, reorderTask } from '../controllers/taskController.js';
import { notAuthorizedTask, notAuthorizedCategory, notAuthorizedComment } from '../middleware/taskMiddleware.js';
import { createCategory, getCategoryList } from '../controllers/categoryController.js';

const router = express.Router();

// partial update for only few field PATCH is used and for all fields update PUT is used

router.use('/', protect);
router.route('/').get(getTaskList);
router.route('/').post(createTask);
router.route('/:id').patch(notAuthorizedTask, editTask);
router.route('/:id').delete(notAuthorizedTask, deleteTask);
router.route('/complete/:id').post(notAuthorizedTask, completeTask);
router.route('/reorder').post(reorderTask);

// router.use('/comments', notAuthorizedComment);
// router.route('/comments/:tasktId').get(getComment);
// router.route('/comments/:tasktId').post(createComment);
// router.route('/comments/:id').patch(editComment);
// router.route('/comments/:id').delete(deleteComment);

export default router;