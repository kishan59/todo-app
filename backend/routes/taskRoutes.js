import  express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createTask, editTask, getAllTaskList, reorderTask } from '../controllers/taskController.js';
import { notAuthorizedTask, notAuthorizedCategory, notAuthorizedComment } from '../middleware/taskMiddleware.js';

const router = express.Router();

// partial update for only few field PATCH is used and for all fields update PUT is used

router.use('/', protect);
router.route('/').get(getAllTaskList);
// router.route('/today').get(getTodayTaskList);
// router.route('/upcoming').get(getUpcomingTaskList);
router.route('/').post(createTask);
router.route('/:id').patch(notAuthorizedTask, editTask);
// router.route('/:id').delete(notAuthorizedTask, deleteTask);
router.route('/reorder').post(notAuthorizedTask, reorderTask);


// router.route('/categories').get(getCategoryList);
// router.route('/categories').post(createCategory);
// router.route('/categories/:id').patch(notAuthorizedCategory, editCategory);
// router.route('/categories/:id').delete(notAuthorizedCategory, deleteCategory);


// router.use('/comments', notAuthorizedComment);
// router.route('/comments/:tasktId').get(getComment);
// router.route('/comments/:tasktId').post(createComment);
// router.route('/comments/:id').patch(editComment);
// router.route('/comments/:id').delete(deleteComment);

export default router;