import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// redirect to login if user is not logged in
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/login';
        return;
    }
    initPage();
});

// initialize log workout page
function initPage() {
    // default date input to today
    const dateInput = document.getElementById('workoutDate');
    // gives a string like "2026-05-14T10:30:00.000Z"
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today;
}

// tab switching
window.switchTab = function (tab) {
    // update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // show the matching tab content, hide the rest
    document.getElementById('shootingTab').classList.toggle('d-none', tab !== 'shooting');
    document.getElementById('handlingTab').classList.toggle('d-none', tab !== 'handling');
    document.getElementById('gamesTab').classList.toggle('d-none', tab !== 'games');
};


// add drill row - so user can fill it out
window.addDrill = function () {
    const list = document.getElementById('drillList');
    const li = document.createElement('li');
    li.className = 'drill-row';
    li.innerHTML = `
        <input type="text" class="drill-name-input" placeholder="Drill name">
        <input type="number" class="drill-count-input" min="0" value="0">
        <select>
            <option value="reps">reps</option>
            <option value="minutes">minutes</option>
            <option value="seconds">seconds</option>
        </select>
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">✕</button>
    `;
    list.appendChild(li);
};

// add game block - so user can fill it out
window.addGame = function () {
    const list = document.getElementById('gamesList');
    const div = document.createElement('div');
    div.className = 'game-block';
    div.innerHTML = `
        <div class="game-block-header">
            <div class="game-players-per-team">
                <span>Players per team</span>
                <input type="number" class="players-per-team-input" min="1" value="5">
            </div>
            <button type="button" class="btn-remove" onclick="this.closest('.game-block').remove()">✕</button>
        </div>
        <div class="game-teams">
            <div class="team-col">
                <label>Team A players</label>
                <input type="text" class="team-a-players" placeholder="e.g. me, John">
                <label>Team A score</label>
                <input type="number" class="team-a-score" min="0" value="0">
            </div>
            <span class="vs-label">vs</span>
            <div class="team-col">
                <label>Team B players</label>
                <input type="text" class="team-b-players" placeholder="e.g. Mike, Sam">
                <label>Team B score</label>
                <input type="number" class="team-b-score" min="0" value="0">
            </div>
        </div>
    `;
    list.appendChild(div);
};

// collect data

// shooting data
function collectShooting() {
    return {
        twos: Number(document.getElementById('inputTwos').value) || 0,
        threes: Number(document.getElementById('inputThrees').value) || 0,
        freeThrows: Number(document.getElementById('inputFT').value) || 0,
        layups: Number(document.getElementById('inputLayups').value) || 0,
        dunks: Number(document.getElementById('inputDunks').value) || 0
    };
}

// handling data 
function collectHandling() {
    const rows = document.querySelectorAll('#drillList .drill-row');
    const drills = [];

    rows.forEach(row => {
        const name = row.querySelector('.drill-name-input').value.trim();
        const count = Number(row.querySelector('.drill-count-input').value) || 0;
        const unit = row.querySelector('select').value;

        // only include drills that have a name
        if (name) {
            drills.push({ name, count, unit });
        }
    });
    return drills;
}

// games data
function collectGames() {
    const blocks = document.querySelectorAll('#gamesList .game-block');
    const games = [];

    blocks.forEach(block => {
        const playersPerTeam = Number(block.querySelector('.players-per-team-input').value) || 0;
        const teamA = {
            players: block.querySelector('.team-a-players').value.trim(),
            score: Number(block.querySelector('.team-a-score').value) || 0
        };
        const teamB = {
            players: block.querySelector('.team-b-players').value.trim(),
            score: Number(block.querySelector('.team-b-score').value) || 0
        };

        // only include games where both teams have players named
        if (teamA.players && teamB.players) {
            games.push({ playersPerTeam, teamA, teamB });
        }
    });
    return games;
}

// save workout
window.saveWorkout = async function () {
    clearError();

    const date = document.getElementById('workoutDate').value;
    if (!date) {
        showError('Please select a date.');
        return;
    }

    // gather data from all three tabs
    const workout = {
        date,
        drills: {
            shooting: collectShooting(),
            handling: collectHandling()
        },
        games: collectGames()
    };

    // check at least one section has data
    const s = workout.drills.shooting;
    const hasShooting = Object.values(s).some(v => v > 0);
    const hasHandling = workout.drills.handling.length > 0;
    const hasGames = workout.games.length > 0;

    if (!hasShooting && !hasHandling && !hasGames) {
        showError('Add at least shooting stat, drill or game before saving.');
        return;
    }

    // disable save button while saving
    const btn = document.getElementById('saveBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch('/api/workouts', {
            method: 'POST',
            headers: {
                // tells the server the body is JSON
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            // converts JavaScript object to JSON
            body: JSON.stringify(workout)
        });

        if (!res.ok) throw new Error('Save failed');

        // success - go to dashboard
        window.location.href = '/dashboard';

    } catch (err) {
        showError('Something went wrong saving your workout. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Save workout';
    }
};

// Error helpers 
function showError(msg) {
    const banner = document.getElementById('errorBanner');
    banner.textContent = msg;
    banner.classList.remove('d-none');
}

function clearError() {
    document.getElementById('errorBanner').classList.add('d-none');
}