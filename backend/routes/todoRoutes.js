import  express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getTaskList } from '../controllers/todoController.js';

const router = express.Router();

router.route('/').post(protect, getTaskList);

export default router;