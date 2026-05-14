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