import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import { getTodayWorkout, getRecentWorkout } from '../controllers/workoutController.js';

const router = express.Router();

// workout routes

// GET /api/workouts/today — returns todays workout
router.get('/workouts/today', verifyToken, getTodayWorkout);
// GET /api/workouts/recent — returns last workout + weekly count
router.get('/workouts/recent', verifyToken, getRecentWorkout);

export default router;