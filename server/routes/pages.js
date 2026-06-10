import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// pages
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/login.html'));
});

router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/dashboard.html'));
});

router.get('/log-workout', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/log-workout.html'));
});

router.get('/workouts', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/workouts.html'));
});

router.get('/workout-detail', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/workout-detail.html'));
});

router.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/profile.html'));
});

router.get('/references', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/references.html'));
});

export default router;