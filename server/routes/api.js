import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import { getTodayWorkout, getRecentWorkout, getAllWorkouts, saveWorkout } from '../controllers/workoutController.js';

const router = express.Router();

// workout routes

// this is for dashobard
// GET /api/workouts/today - returns todays workout
router.get('/workouts/today', verifyToken, getTodayWorkout);
// GET /api/workouts/recent - returns last workout + weekly count
router.get('/workouts/recent', verifyToken, getRecentWorkout);

// this is for workouts historys
// GET /api/workouts — returns all workouts
router.get('/workouts', verifyToken, getAllWorkouts);

// this is for log workout
// POST /api/workouts - saves a new workout
router.post('/workouts', verifyToken, saveWorkout);

export default router;