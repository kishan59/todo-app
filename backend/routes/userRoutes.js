import express from "express";
import { getUserProfile, getUsersList, loginUser, logoutUser, registerUser, updateUserProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.route('/profile').get(protect, getUserProfile);
router.route('/profile/:id').put(protect, updateUserProfile);
router.route('/all').get(protect, getUsersList);

export default router;