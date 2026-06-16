import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// inject navbar HTML
function injectNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;

    nav.innerHTML = `
        <div class="nav-brand">
            <div class="nav-brand-icon">
                <img src="../assets/svg/logo.svg" alt="Swish" width="28" height="28">
            </div>
            <span class="nav-brand-name">SW<span>I</span>SH</span>
        </div>

        <div class="nav-links">
            <a href="/dashboard" class="nav-link" data-path="/dashboard">Dashboard</a>
            <a href="/log-workout" class="nav-link" data-path="/log-workout">Log workout</a>
            <a href="/workouts" class="nav-link" data-path="/workouts">Workouts</a>
            <a href="/profile" class="nav-link" data-path="/profile">Profile</a>
            <a href="/references" class="nav-link" data-path="/references">References</a>
        </div>

        <div class="nav-right">
            <span id="navUsername" class="nav-username"></span>
            <button class="nav-logout-btn" id="logoutBtn">Log out</button>
            <button class="nav-hamburger" id="hamburgerBtn" aria-label="Open menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>

        <!-- overlay -->
        <div class="nav-overlay" id="navOverlay"></div>

        <!-- drawer -->
        <div class="nav-drawer" id="navDrawer">
            <div class="drawer-header">
                <span class="drawer-title">Menu</span>
                <button class="drawer-close" id="drawerClose" aria-label="Close menu">✕</button>
            </div>
            <div class="drawer-username" id="drawerUsername"></div>
            <nav class="drawer-links">
                <a href="/dashboard" class="drawer-link" data-path="/dashboard">Dashboard</a>
                <a href="/log-workout" class="drawer-link" data-path="/log-workout">Log workout</a>
                <a href="/workouts" class="drawer-link" data-path="/workouts">Workouts</a>
                <a href="/profile" class="drawer-link" data-path="/profile">Profile</a>
                <a href="/references" class="drawer-link" data-path="/references">References</a>
            </nav>
            <button class="drawer-logout-btn" id="drawerLogoutBtn">Log out</button>
        </div>
    `;
}

// set active link
function setActiveLink() {
    const currentPath = window.location.pathname;

    // set active on navbar links
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.dataset.path === currentPath) {
            link.classList.add('active');
        }
    });

    // set active on drawer links
    document.querySelectorAll('.drawer-link').forEach(link => {
        if (link.dataset.path === currentPath) {
            link.classList.add('active');
        }
    });
}

// set username
function setUsername(displayName) {
    const navEl = document.getElementById('navUsername');
    const drawerEl = document.getElementById('drawerUsername');
    if (navEl) navEl.textContent = displayName || '';
    if (drawerEl) drawerEl.textContent = displayName || '';
}

// drawer toggle
function bindDrawer() {
    const hamburger = document.getElementById('hamburgerBtn');
    const drawer = document.getElementById('navDrawer');
    const overlay = document.getElementById('navOverlay');
    const closeBtn = document.getElementById('drawerClose');

    // open drawer
    hamburger.addEventListener('click', () => {
        drawer.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    });

    // close drawer on overlay click
    overlay.addEventListener('click', closeDrawer);

    // close drawer on X button
    closeBtn.addEventListener('click', closeDrawer);

    // close drawer when a link is clicked
    document.querySelectorAll('.drawer-link').forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    function closeDrawer() {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// logout
function bindLogout() {
    // navbar logout button
    const btn = document.getElementById('logoutBtn');
    if (btn) {
        btn.addEventListener('click', async () => {
            sessionStorage.removeItem('username');
            await signOut(auth);
            window.location.href = '/login';
        });
    }

    // drawer logout button
    const drawerBtn = document.getElementById('drawerLogoutBtn');
    if (drawerBtn) {
        drawerBtn.addEventListener('click', async () => {
            sessionStorage.removeItem('username');
            await signOut(auth);
            window.location.href = '/login';
        });
    }
}

// init
onAuthStateChanged(auth, (user) => {
    injectNavbar();
    setActiveLink();
    bindDrawer();
    bindLogout();

    if (user) {
        setUsername(user.displayName);
    }
});