import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// redirect to login if user is not logged in
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/login';
        return
    }
    initDashboard(user);
});

// initialize dashboard 
async function initDashboard(user) {
    
    setGreeting(user.displayName);

    // get the id token to authenticate API requests
    const token = await user.getIdToken();

    // fecth todays and recent workouts
    const [todayRes, recentRes] = await Promise.all([
        fetch('/api/workouts/today', {
            headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/workouts/recent', {
            headers: { Authorization: `Bearer ${token}` }
        })
    ]); 

    const todayData = await todayRes.json()
    const recentData = await recentRes.json()

    // update weekly count badge
    document.getElementById('weeklyCount').textContent = recentData.weeklyCount || 0;

    // decide which case to render
    if (todayData.workout) {
        renderWorkoutCard(todayData.workout, true);
    } else if (recentData.workout) {
        showCtaBanner();
        renderWorkoutCard(recentData.workout, false);
    } else {
        showEmptyState();
    }
}

// greeting
function setGreeting(displayName) {
    //greeting based on time of day
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    if (hour >= 17) greeting = 'Good evening';

    document.getElementById('greetingText').textContent = `${greeting}, ${displayName}`;

    const dateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    document.getElementById('greetingDate').textContent = dateStr;
}

// render workout card
function renderWorkoutCard(workout, isToday) {
    
    // show the card - remove d-none
    const card = document.getElementById('workoutCard');
    card.classList.remove('d-none');
    
    // section label
    const label = isToday
        ? "Today's workout"
        : `Last workout — ${formatDate(workout.date)}`;
    document.getElementById('sectionLabel').textContent = label;

    // card date
    const cardDate = isToday
        ? `Logged today`
        : `Logged ${formatDate(workout.date)}`;
    document.getElementById('cardDate').textContent = cardDate;

    // edit or view button
    const actionBtn = document.getElementById('cardAction');
    actionBtn.textContent = isToday ? 'Edit' : 'View';
    actionBtn.href = `/workout-detail?id=${workout.id}`;

    // render shooting section if data exists
    const shooting = workout.drills?.shooting;
    const hasShootingData = shooting && Object.values(shooting).some(v => v > 0);

    if (hasShootingData) {
        document.getElementById('statTwos').textContent = shooting.twos || 0;
        document.getElementById('statThrees').textContent = shooting.threes || 0;
        document.getElementById('statFT').textContent = shooting.freeThrows || 0;
        document.getElementById('statLayups').textContent = shooting.layups || 0;
        document.getElementById('statDunks').textContent = shooting.dunks || 0;
        document.getElementById('shootingSection').classList.remove('d-none');
    }

    // render handling section if data exists
    const handling = workout.drills?.handling;
    if (handling && handling.length > 0) {

        // show divider only if shooting is also showing
        if (hasShootingData) {
            document.getElementById('cardDivider').classList.remove('d-none');
        }

        renderDrills(handling, workout.id);
        document.getElementById('handlingSection').classList.remove('d-none');
    }

    // render games only if no shooting data
    const games = workout.games;
    if (!hasShootingData && games && games.length > 0) {
        renderGames(games);
        document.getElementById('gamesSection').classList.remove('d-none');
    }
}

// render drills
function renderDrills(drills, workoutId) {
    const list = document.getElementById('drillList');
    const viewAllLink = document.getElementById('viewAllLink');

    // show max 3 drills
    const visible = drills.slice(0, 3);

    visible.forEach(drill => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="drill-name">${drill.name}</span>
            <span class="drill-count"><span>${drill.count}</span> ${drill.unit}</span>
        `;
        list.appendChild(li);
    });

    // show view all link if more than 3 drills
    if (drills.length > 3) {
        viewAllLink.href = `/workout-detail?id=${workoutId}`;
        viewAllLink.classList.remove('d-none');
    }
}

// render games
function renderGames(games) {
    const list = document.getElementById('gamesList');

    games.forEach(game => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="game-teams">${game.teamA.players} vs ${game.teamB.players}</span>
            <span class="game-score"><span>${game.teamA.score}</span> — <span>${game.teamB.score}</span></span>
        `;
        list.appendChild(li);
    });
}

// call to action banner
function showCtaBanner() {
    document.getElementById('ctaBanner').classList.remove('d-none');
}

// empty state 
function showEmptyState() {
    document.getElementById('emptyState').classList.remove('d-none');
}

// format date - used workout card
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
}