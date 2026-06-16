import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import {
    getTodayWorkout,
    getRecentWorkout,
    saveWorkout,
    getAllWorkouts,
    getWorkoutById,
    updateWorkout,
    deleteWorkout
} from '../controllers/workoutController.js';
import {
    getTemplates,
    saveTemplate,
    deleteTemplate
} from '../controllers/drillController.js';

const router = express.Router();

// workout routes

// this is for dashobard
// GET /api/workouts/today - returns todays workout
router.get('/workouts/today', verifyToken, getTodayWorkout);
// GET /api/workouts/recent - returns last workout + weekly count
router.get('/workouts/recent', verifyToken, getRecentWorkout);

// this is for workouts history
// GET /api/workouts — returns all workouts
router.get('/workouts', verifyToken, getAllWorkouts);

// this is for log workout
// POST /api/workouts - saves a new workout
router.post('/workouts', verifyToken, saveWorkout);

// this is for workout details
// GET /api/workouts/:id — returns one workout
router.get('/workouts/:id', verifyToken, getWorkoutById);
// PUT /api/workouts/:id — updates a workout
router.put('/workouts/:id', verifyToken, updateWorkout);
// DELETE /api/workouts/:id — deletes a workout
router.delete('/workouts/:id', verifyToken, deleteWorkout);

// drill template routes
// GET /api/templates — returns all templates
router.get('/templates', verifyToken, getTemplates);
// POST /api/templates — saves a new template
router.post('/templates', verifyToken, saveTemplate);
// DELETE /api/templates/:id — deletes a template
router.delete('/templates/:id', verifyToken, deleteTemplate);

export default router;