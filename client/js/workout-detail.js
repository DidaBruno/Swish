import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// state
let workoutId = null;
let currentWorkout = null;

// get workout ID from URL
const params = new URLSearchParams(window.location.search);
workoutId = params.get('id');

// redirect to login if user is not logged in
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/login';
        return;
    }
    if (!workoutId) {
        showError();
        return;
    }
    loadWorkout(user);
});

// load workout
async function loadWorkout(user) {
    try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/workouts/${workoutId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            showError();
            return;
        }

        const data = await res.json();
        currentWorkout = data.workout;

        document.getElementById('loadingState').classList.add('d-none');
        document.getElementById('workoutContent').classList.remove('d-none');

        renderView();

    } catch (err) {
        console.error('Failed to load workout:', err);
        showError();
    }
}

// show error state
function showError() {
    document.getElementById('loadingState').classList.add('d-none');
    document.getElementById('errorState').classList.remove('d-none');
}

// render view mode
function renderView() {
    const w = currentWorkout;

    // date heading
    document.getElementById('workoutDate').textContent = formatDate(w.date);

    // shooting
    const shooting = w.drills?.shooting;
    const hasShooting = shooting && Object.values(shooting).some(v => v > 0);
    if (hasShooting) {
        document.getElementById('shootingView').innerHTML = `
            <div class="stat-box"><span class="stat-val">${shooting.twos || 0}</span><span class="stat-lbl">2-pointers</span></div>
            <div class="stat-box"><span class="stat-val">${shooting.threes || 0}</span><span class="stat-lbl">3-pointers</span></div>
            <div class="stat-box"><span class="stat-val">${shooting.freeThrows || 0}</span><span class="stat-lbl">Free throws</span></div>
            <div class="stat-box"><span class="stat-val">${shooting.layups || 0}</span><span class="stat-lbl">Layups</span></div>
            <div class="stat-box"><span class="stat-val">${shooting.dunks || 0}</span><span class="stat-lbl">Dunks</span></div>
        `;
        document.getElementById('shootingSection').classList.remove('d-none');
    }

    // handling
    const handling = w.drills?.handling;
    if (handling && handling.length > 0) {
        document.getElementById('handlingView').innerHTML = handling.map(d => `
            <li>
                <span class="detail-drill-name">${d.name}</span>
                <span class="detail-drill-count"><span>${d.count}</span> ${d.unit}</span>
            </li>
        `).join('');
        document.getElementById('handlingSection').classList.remove('d-none');
    }

    // games
    const games = w.games;
    if (games && games.length > 0) {
        document.getElementById('gamesView').innerHTML = games.map(g => `
            <li>
                <span class="detail-game-teams">${g.teamA.players} vs ${g.teamB.players}</span>
                <span class="detail-game-score"><span>${g.teamA.score}</span> — <span>${g.teamB.score}</span></span>
            </li>
        `).join('');
        document.getElementById('gamesSection').classList.remove('d-none');
    }
}

// enter edit mode
window.enterEditMode = function () {
    const w = currentWorkout;

    // toggle buttons
    document.getElementById('editBtn').classList.add('d-none');
    document.getElementById('deleteBtn').classList.add('d-none');
    document.getElementById('saveBtn').classList.remove('d-none');
    document.getElementById('cancelBtn').classList.remove('d-none');

    // make sure all sections are visible in edit mode
    document.getElementById('shootingSection').classList.remove('d-none');
    document.getElementById('handlingSection').classList.remove('d-none');
    document.getElementById('gamesSection').classList.remove('d-none');

    // shooting - hide view, show edit
    document.getElementById('shootingView').classList.add('d-none');
    const shooting = w.drills?.shooting || {};
    document.getElementById('shootingEdit').innerHTML = `
        <div class="input-box"><label>2-pointers</label><input type="number" id="editTwos" min="0" value="${shooting.twos || 0}"></div>
        <div class="input-box"><label>3-pointers</label><input type="number" id="editThrees" min="0" value="${shooting.threes || 0}"></div>
        <div class="input-box"><label>Free throws</label><input type="number" id="editFT" min="0" value="${shooting.freeThrows || 0}"></div>
        <div class="input-box"><label>Layups</label><input type="number" id="editLayups" min="0" value="${shooting.layups || 0}"></div>
        <div class="input-box"><label>Dunks</label><input type="number" id="editDunks" min="0" value="${shooting.dunks || 0}"></div>
    `;
    document.getElementById('shootingEdit').classList.remove('d-none');

    // handling - hide view, show edit
    document.getElementById('handlingView').classList.add('d-none');
    const drillList = document.getElementById('drillEditList');
    drillList.innerHTML = '';
    const handling = w.drills?.handling || [];
    handling.forEach(d => addDrill(d));
    document.getElementById('handlingEdit').classList.remove('d-none');

    // games - hide view, show edit
    document.getElementById('gamesView').classList.add('d-none');
    const gameList = document.getElementById('gameEditList');
    gameList.innerHTML = '';
    const games = w.games || [];
    games.forEach(g => addGame(g));
    document.getElementById('gamesEdit').classList.remove('d-none');
};

// cancel edit
window.cancelEdit = function () {
    // just reload the page to reset to view mode
    window.location.reload();
};

// add drill row
window.addDrill = function (drill) {
    const list = document.getElementById('drillEditList');
    const li = document.createElement('li');
    li.className = 'drill-row';
    li.innerHTML = `
        <input type="text" class="drill-name-input" placeholder="Drill name" value="${drill?.name || ''}">
        <input type="number" class="drill-count-input" min="0" value="${drill?.count || 0}">
        <select>
            <option value="reps" ${drill?.unit === 'reps' ? 'selected' : ''}>reps</option>
            <option value="minutes" ${drill?.unit === 'minutes' ? 'selected' : ''}>minutes</option>
            <option value="seconds" ${drill?.unit === 'seconds' ? 'selected' : ''}>seconds</option>
        </select>
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">✕</button>
    `;
    list.appendChild(li);
};

// add game block
window.addGame = function (game) {
    const list = document.getElementById('gameEditList');
    const div = document.createElement('div');
    div.className = 'game-block';
    div.innerHTML = `
        <div class="game-block-header">
            <div class="game-players-per-team">
                <span>Players per team</span>
                <input type="number" class="players-per-team-input" min="1" value="${game?.playersPerTeam || 5}">
            </div>
            <button type="button" class="btn-remove" onclick="this.closest('.game-block').remove()">✕</button>
        </div>
        <div class="game-teams">
            <div class="team-col">
                <label>Team A players</label>
                <input type="text" class="team-a-players" value="${game?.teamA?.players || ''}">
                <label>Team A score</label>
                <input type="number" class="team-a-score" min="0" value="${game?.teamA?.score || 0}">
            </div>
            <span class="vs-label">vs</span>
            <div class="team-col">
                <label>Team B players</label>
                <input type="text" class="team-b-players" value="${game?.teamB?.players || ''}">
                <label>Team B score</label>
                <input type="number" class="team-b-score" min="0" value="${game?.teamB?.score || 0}">
            </div>
        </div>
    `;
    list.appendChild(div);
};

// save changes
window.saveChanges = async function () {
    clearError();

    // collect updated data
    const updated = {
        date: currentWorkout.date,
        drills: {
            shooting: {
                twos: Number(document.getElementById('editTwos').value) || 0,
                threes: Number(document.getElementById('editThrees').value) || 0,
                freeThrows: Number(document.getElementById('editFT').value) || 0,
                layups: Number(document.getElementById('editLayups').value) || 0,
                dunks: Number(document.getElementById('editDunks').value) || 0
            },
            handling: collectDrills()
        },
        games: collectGames()
    };

    // validate at least one section has data
    const s = updated.drills.shooting;
    const hasShooting = Object.values(s).some(v => v > 0);
    const hasHandling = updated.drills.handling.length > 0;
    const hasGames = updated.games.length > 0;

    if (!hasShooting && !hasHandling && !hasGames) {
        showBannerError('A workout needs at least one drill, shooting stat, or game.');
        return;
    }

    const btn = document.getElementById('saveBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`/api/workouts/${workoutId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updated)
        });

        if (!res.ok) throw new Error('Update failed');

        // reload to show updated view
        window.location.reload();

    } catch (err) {
        showBannerError('Something went wrong saving your changes. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Save';
    }
};

// collect drills
function collectDrills() {
    const rows = document.querySelectorAll('#drillEditList .drill-row');
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

// collect games
function collectGames() {
    const blocks = document.querySelectorAll('#gameEditList .game-block');
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

// delete popup
window.openDeletePopup = function () {
    document.getElementById('deletePopup').classList.remove('d-none');
};

window.closeDeletePopup = function () {
    document.getElementById('deletePopup').classList.add('d-none');
};

window.confirmDelete = async function () {
    try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`/api/workouts/${workoutId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Delete failed');

        // go back to workouts list
        window.location.href = '/workouts';

    } catch (err) {
        console.error('Delete failed:', err);
        closeDeletePopup();
    }
};

// error helpers
function showBannerError(msg) {
    const banner = document.getElementById('errorBanner');
    banner.textContent = msg;
    banner.classList.remove('d-none');
}

function clearError() {
    document.getElementById('errorBanner').classList.add('d-none');
}

// format date
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}