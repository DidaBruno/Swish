import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// state
let allWorkouts = [];
let typeFilter = 'all';

// redirect to login if user is not logged in
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/login';
        return;
    }
    loadWorkouts(user);
});

// load workouts
async function loadWorkouts(user) {
    try {
        const token = await user.getIdToken();
        const res = await fetch('/api/workouts', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        allWorkouts = data.workouts || [];

        document.getElementById('loadingState').classList.add('d-none');

        if (allWorkouts.length === 0) {
            document.getElementById('emptyState').classList.remove('d-none');
            return;
        }

        applyFilters();

    } catch (err) {
        console.error('Failed to load workouts:', err);
        document.getElementById('loadingState').textContent = 'Failed to load workouts.';
    }
}

// type filter
window.setTypeFilter = function (type) {
    typeFilter = type;
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    applyFilters();
};

// apply filters
window.applyFilters = function () {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;

    let filtered = allWorkouts.filter(workout => {
        // type filter
        if (typeFilter !== 'all' && !workoutHasType(workout, typeFilter)) {
            return false;
        }
        // date from filter
        if (dateFrom && workout.date < dateFrom) {
            return false;
        }
        // date to filter
        if (dateTo && workout.date > dateTo) {
            return false;
        }
        return true;
    });

    renderWorkouts(filtered);
};

// reset filters
window.resetFilters = function () {
    typeFilter = 'all';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === 'all');
    });
    applyFilters();
};

// check if workout has a type
function workoutHasType(workout, type) {
    if (type === 'shooting') {
        const s = workout.drills?.shooting;
        return s && Object.values(s).some(v => v > 0);
    }
    if (type === 'handling') {
        return workout.drills?.handling?.length > 0;
    }
    if (type === 'games') {
        return workout.games?.length > 0;
    }
    return true;
}

// render workouts grouped by month
function renderWorkouts(workouts) {
    const container = document.getElementById('workoutsContainer');
    const noMatch = document.getElementById('noMatchState');

    container.innerHTML = '';

    if (workouts.length === 0) {
        noMatch.classList.remove('d-none');
        return;
    }
    noMatch.classList.add('d-none');

    // group workouts by month
    const groups = groupByMonth(workouts);

    // render each month group
    for (const [month, monthWorkouts] of groups) {
        const group = document.createElement('div');
        group.className = 'month-group';

        const heading = document.createElement('h2');
        heading.className = 'month-heading';
        heading.textContent = month;
        group.appendChild(heading);

        const grid = document.createElement('div');
        grid.className = 'workout-grid';

        monthWorkouts.forEach(workout => {
            grid.appendChild(buildCard(workout));
        });

        group.appendChild(grid);
        container.appendChild(group);
    }
}

// group workouts by month
function groupByMonth(workouts) {
    const map = new Map();

    workouts.forEach(workout => {
        const date = new Date(workout.date);
        const monthKey = date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        if (!map.has(monthKey)) {
            map.set(monthKey, []);
        }
        map.get(monthKey).push(workout);
    });

    return map;
}

// build a workout card
function buildCard(workout) {
    const card = document.createElement('a');
    card.className = 'history-card';
    card.href = `/workout-detail?id=${workout.id}`;

    // date
    const dateStr = new Date(workout.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    // build stat highlights
    const stats = [];
    const badges = [];

    const shooting = workout.drills?.shooting;
    const hasShooting = shooting && Object.values(shooting).some(v => v > 0);
    if (hasShooting) {
        const totalShots = (shooting.twos || 0) + (shooting.threes || 0) +
            (shooting.freeThrows || 0) + (shooting.layups || 0) + (shooting.dunks || 0);
        stats.push({ label: 'Total shots made', value: totalShots });
        badges.push('Shooting');
    }

    const handling = workout.drills?.handling;
    if (handling && handling.length > 0) {
        stats.push({ label: 'Drills', value: handling.length });
        badges.push('Handling');
    }

    const games = workout.games;
    if (games && games.length > 0) {
        stats.push({ label: 'Games', value: games.length });
        badges.push('Games');
    }

    // build inner HTML
    const statsHtml = stats.map(s => `
        <div class="history-stat">
            <span class="history-stat-label">${s.label}</span>
            <span class="history-stat-value">${s.value}</span>
        </div>
    `).join('');

    const badgesHtml = badges.map(b => `<span class="history-badge">${b}</span>`).join('');

    card.innerHTML = `
        <div class="history-card-date">${dateStr}</div>
        <div class="history-stats">${statsHtml}</div>
        <div class="history-badges">${badgesHtml}</div>
    `;

    return card;
}