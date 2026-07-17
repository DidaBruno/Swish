
<img width="2000" height="250" alt="Swish" src="https://github.com/user-attachments/assets/85cd71ce-d1b2-4d41-a5a2-eb61542e134f" />

#
Web app that allows you to track you basketball workouts and see your achievements. Workouts are comprised of shooting and handling skills along with stats from played games.

<img width="1918" height="862" alt="1-swish" src="https://github.com/user-attachments/assets/a0bea2df-7a5c-4d0c-88c8-3cd8eaf2c112" />

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
