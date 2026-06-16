import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { db } from './firebase-config.js';

export async function getUsername(user) {
    const cached = sessionStorage.getItem('username');
    if (cached) return cached;

    const snap = await getDoc(doc(db, 'users', user.uid));
    const username = snap.exists() ? snap.data().username : '';
    sessionStorage.setItem('username', username);
    return username;
}