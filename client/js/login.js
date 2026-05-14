// firebase imports
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

// redirect for logged in users
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "/dashboard";
    }
});

// tab switching - login/register
window.switchTab = function(tab) {
    const isLogin = tab === 'login';
    document.getElementById('tabLogin').classList.toggle('active', isLogin);
    document.getElementById('tabRegister').classList.toggle('active', !isLogin);
    document.getElementById('loginForm').classList.toggle('d-none', !isLogin);
    document.getElementById('registerForm').classList.toggle('d-none', isLogin);
    document.getElementById('successMsg').classList.add('d-none');
    document.getElementById('errorMsg').classList.add('d-none');
};

// helper functions for validation
function isValidEmail(val) {
    return  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function showError(errorId, inputId) {
    document.getElementById(errorId).classList.add('show');
    if (inputId) document.getElementById(inputId).classList.add('is-invalid');
}

function clearErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('input').forEach(el => el.classList.remove('is-invalid'));
    document.getElementById('errorMsg').classList.add('d-none');
}

function showBannerError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.classList.remove('d-none');
}

function setLoading(btnId, loading, label) {
  const btn = document.getElementById(btnId);
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait...' : label;
}

// password toggle
window.togglePassword = function(inputId, btn) {
    const input = document.getElementById(inputId);
    const img = btn.querySelector('img');

    if (input.type === 'password') {
        input.type = 'text';
        img.src = '../assets/svg/eye-off.svg';
    } else {
        input.type = 'password';
        img.src = '../assets/svg/eye.svg';
    }
}

// password strenght check
window.checkStrength = function() {
    const val = document.getElementById('registerPassword').value;
    const segs = ['s1','s2','s3','s4'].map(id => document.getElementById(id));
    const label = document.getElementById('strengthLabel');
    let score = 0;
    
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const colors = ['#E24B4A', '#EF9F27', '#2A7DE1', '#1D9E75'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    segs.forEach((s, i) => { s.style.background = i < score ? colors[score - 1] : '#1E2D40'; });
    label.textContent = val.length ? labels[score] : '';
    label.style.color = score > 0 ? colors[score - 1] : '#4A5A6E';
}

// login
window.handleLogin = async function() {
    clearErrors();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    let valid = true;

    if (!isValidEmail(email)) { showError('loginEmailError', 'loginEmail'); valid = false; }
    if (!password) { showError('loginPasswordError', 'loginPassword'); valid = false; }
    if (!valid) return;

    setLoading('loginBtn', true, 'Log in');

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        const msg = err.code === 'auth/invalid-credential'
        ? 'Incorrect email or password.'
        : 'Something went wrong. Please try again.';
        showBannerError(msg);
    } finally {
        setLoading('loginBtn', false, 'Log in');
    }
};

// register
window.handleRegister = async function() {
    clearErrors();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    let valid = true;

    if (username.length < 3 || username.includes(' ')) { showError('registerUsernameError', 'registerUsername'); valid = false; }
    if (!isValidEmail(email)) { showError('registerEmailError', 'registerEmail'); valid = false; }
    if (password.length < 6) { showError('registerPasswordError', 'registerPassword'); valid = false; }
    if (password !== confirm) { showError('registerConfirmError', 'registerConfirm'); valid = false; }
    if (!valid) return;

    setLoading('registerBtn', true, 'Create account');

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // save username as displayName on the Firebase Auth user
        await updateProfile(user, { displayName: username });

        await setDoc(doc(db, 'users', user.uid), {
            username,
            email,
            createdAt: serverTimestamp()
        });

        switchTab('login');
        document.getElementById('successMsg').classList.remove('d-none');
    } catch (err) {
        const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : 'Something went wrong. Please try again.';
        showBannerError(msg);
    } finally {
        setLoading('registerBtn', false, 'Create account');
    }
};