# Swish

Web app that allows you to track you basketball workouts and see your achievements. Workouts are comprised of shooting and handling skills along with stats from played games.

## Stack
- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js, Express.js
- Database: Firebase Firestore
- Auth: Firebase Authentication (client side)

## Pages and URLs
- /login — login/register
- /dashboard — today's workout snapshot
- /log-workout — create new workout
- /workouts — workout history
- /workout-detail — single workout view and edit
- /profile — user info and stats
- /references — sources page

## Database Collections
- users: { username, email, createdAt }
- workouts: { userId, date, drills: { shooting, handling }, games }
- drillTemplates: { userId, name, category, defaultUnit, createdAt }
