import { db } from '../firebase.js';

// get todays workout
export async function getTodayWorkout(req, res) {
    try {
        const userId = req.user.uid;

        // 2026-05-14T10:30:00.000Z -> 2026-05-14
        const today = new Date().toISOString().split('T')[0];

        const snapshot = await db
            .collection('workouts')
            .where('userId', '==', userId)
            .where('date', '==', today)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            return res.json({ workout: null });
        }

        const doc = snapshot.docs[0];
        return res.json({ workout: { id: doc.id, ...doc.data() } });

    } catch (err) {
        console.error('getTodayWorkout error:', err);
        res.status(500).json({ error: 'Failed to fetch today\'s workout' });
    }
}

export async function getRecentWorkout(req, res) {
    try {
        const userId = req.user.uid;

        const now = new Date();
        const day = now.getDay();
        const diff = day === 0 ? 6 : day - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - diff);
        const weekStart = monday.toISOString().split('T')[0];

        // fetch all workouts from this week to get the count
        const weekSnapshot = await db
            .collection('workouts')
            .where('userId', '==', userId)
            .where('date', '>=', weekStart)
            .get();

        const weeklyCount = weekSnapshot.size;

        // fetch the single most recent workout overall
        const recentSnapshot = await db
            .collection('workouts')
            .where('userId', '==', userId)
            .orderBy('date', 'desc')
            .limit(1)
            .get();

        if (recentSnapshot.empty) {
            return res.json({ workout: null, weeklyCount });
        }

        const doc = recentSnapshot.docs[0];
        return res.json({
            workout: { id: doc.id, ...doc.data() },
            weeklyCount
        });


    } catch (err) {
        console.error('getRecentWorkout error:', err);
        res.status(500).json({ error: 'Failed to fetch recent workout' });
    }
}

// save a new workout to database
export async function saveWorkout(req, res) {
    try {
        const userId = req.user.uid;

        // reject future dates
        const today = new Date().toISOString().split('T')[0];
        if (req.body.date > today) {
            return res.status(400).json({ error: 'Cannot log a workout for a future date' });
        }

        // build the workout object from the request body
        const workout = {
            userId,
            date: req.body.date,
            drills: {
                shooting: req.body.drills?.shooting || {},
                handling: req.body.drills?.handling || []
            },
            games: req.body.games || [],
            createdAt: new Date().toISOString()
        };

        // add a new document to the workouts collection
        const docRef = await db.collection('workouts').add(workout);

        // return the new document id
        return res.status(201).json({ id: docRef.id });

    } catch (err) {
        console.error('saveWorkout error:', err);
        res.status(500).json({ error: 'Failed to save workout' });
    }
}