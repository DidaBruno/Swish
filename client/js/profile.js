import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { db } from './firebase-config.js';

// redirect to login if user is not logged in
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/login';
        return;
    }
    initProfile(user);
});

// init
async function initProfile(user) {
    await loadUserInfo(user);
    await loadStats(user);
}

// load user info from Firestore
async function loadUserInfo(user) {
    try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists()) return;

        const data = snap.data();

        // username
        const username = data.username || '';
        document.getElementById('profileUsername').textContent = username;
        document.getElementById('profileAvatar').textContent = username.charAt(0);

        // member since - createdAt is a Firestore timestamp
        if (data.createdAt) {
            const date = data.createdAt.toDate();
            const dateStr = date.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
            document.getElementById('profileMemberSince').textContent = `Member since ${dateStr}`;
        }

    } catch (err) {
        console.error('Failed to load user info:', err);
    }
}

// load stats from API
async function loadStats(user) {
    try {
        const token = await user.getIdToken();
        const res = await fetch('/api/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const stats = await res.json();

        // hide loading, show content
        document.getElementById('loadingState').classList.add('d-none');
        document.getElementById('statsContent').classList.remove('d-none');

        // headline stats
        document.getElementById('statTotalWorkouts').textContent = stats.totalWorkouts || 0;
        document.getElementById('statBiggestStreak').textContent = stats.biggestStreak || 0;
        document.getElementById('statTotalShots').textContent = stats.totalShots || 0;
        document.getElementById('statGamesPlayed').textContent = stats.gamesPlayed || 0;

        // shooting breakdown
        const s = stats.shootingTotals || {};
        document.getElementById('statTwos').textContent = s.twos || 0;
        document.getElementById('statThrees').textContent = s.threes || 0;
        document.getElementById('statFreeThrows').textContent = s.freeThrows || 0;
        document.getElementById('statLayups').textContent = s.layups || 0;
        document.getElementById('statDunks').textContent = s.dunks || 0;

    } catch (err) {
        console.error('Failed to load stats:', err);
        document.getElementById('loadingState').textContent = 'Failed to load stats.';
    }
}