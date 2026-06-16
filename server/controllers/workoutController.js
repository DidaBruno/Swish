import { db } from '../firebase.js';

// this is for dashobard
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

// this is for dashobard
// get recent workout
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

// this is for log workout
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

// this is for workouts history
// get all workouts
export async function getAllWorkouts(req, res) {
    try {
        const userId = req.user.uid;

        // fetch all workouts for this user, newest first
        const snapshot = await db
            .collection('workouts')
            .where('userId', '==', userId)
            .orderBy('date', 'desc')
            .get();

        // map each document into a clean object with its id
        const workouts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.json({ workouts });

    } catch (err) {
        console.error('getAllWorkouts error:', err);
        res.status(500).json({ error: 'Failed to fetch workouts' });
    }
}

// this is for workout detail
// get one workout by id
export async function getWorkoutById(req, res) {
    try {
        const userId = req.user.uid;
        const workoutId = req.params.id;

        const doc = await db.collection('workouts').doc(workoutId).get();

        // check the workout exists
        if (!doc.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        const workout = doc.data();

        // make sure this workout belongs to the requesting user
        if (workout.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        return res.json({ workout: { id: doc.id, ...workout } });

    } catch (err) {
        console.error('getWorkoutById error:', err);
        res.status(500).json({ error: 'Failed to fetch workout' });
    }
}

// this is for workout detail
// update a workout
export async function updateWorkout(req, res) {
    try {
        const userId = req.user.uid;
        const workoutId = req.params.id;

        const docRef = db.collection('workouts').doc(workoutId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        // make sure this workout belongs to the requesting user
        if (doc.data().userId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // build the updated fields
        const updated = {
            drills: {
                shooting: req.body.drills?.shooting || {},
                handling: req.body.drills?.handling || []
            },
            games: req.body.games || [],
            updatedAt: new Date().toISOString()
        };

        await docRef.update(updated);

        return res.json({ success: true });

    } catch (err) {
        console.error('updateWorkout error:', err);
        res.status(500).json({ error: 'Failed to update workout' });
    }
}

// this is for workout detail
// delete a workout
export async function deleteWorkout(req, res) {
    try {
        const userId = req.user.uid;
        const workoutId = req.params.id;

        const docRef = db.collection('workouts').doc(workoutId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        // make sure this workout belongs to the requesting user
        if (doc.data().userId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await docRef.delete();

        return res.json({ success: true });

    } catch (err) {
        console.error('deleteWorkout error:', err);
        res.status(500).json({ error: 'Failed to delete workout' });
    }
}

// this is for profile
// get user stats
export async function getStats(req, res) {
    try {
        const userId = req.user.uid;

        // fetch all the user's workouts
        const snapshot = await db
            .collection('workouts')
            .where('userId', '==', userId)
            .orderBy('date', 'asc')
            .get();

        const workouts = snapshot.docs.map(doc => doc.data());

        // totals
        let totalShots = 0;
        const shootingTotals = { twos: 0, threes: 0, freeThrows: 0, layups: 0, dunks: 0 };
        let gamesPlayed = 0;

        workouts.forEach(w => {
            const s = w.drills?.shooting;
            if (s) {
                shootingTotals.twos += s.twos || 0;
                shootingTotals.threes += s.threes || 0;
                shootingTotals.freeThrows += s.freeThrows || 0;
                shootingTotals.layups += s.layups || 0;
                shootingTotals.dunks += s.dunks || 0;
            }
            gamesPlayed += w.games?.length || 0;
        });

        totalShots = shootingTotals.twos + shootingTotals.threes +
            shootingTotals.freeThrows + shootingTotals.layups + shootingTotals.dunks;

        // biggest streak
        const biggestStreak = calculateStreak(workouts);

        return res.json({
            totalWorkouts: workouts.length,
            biggestStreak,
            totalShots,
            shootingTotals,
            gamesPlayed
        });

    } catch (err) {
        console.error('getStats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
}

// Helper function to calculate biggest consecutive-day streak
function calculateStreak(workouts) {
    if (workouts.length === 0) return 0;

    // get unique workout dates as a sorted set of YYYY-MM-DD strings
    const uniqueDates = [...new Set(workouts.map(w => w.date))].sort();

    let biggest = 1;
    let current = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);

        // difference in days between consecutive dates
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            // consecutive day - extend the streak
            current++;
            biggest = Math.max(biggest, current);
        } else {
            // gap - reset the streak
            current = 1;
        }
    }

    return biggest;
}