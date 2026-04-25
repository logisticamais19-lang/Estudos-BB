import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            "AIzaSyB5G4LpWCp79PClYSpqzbrn0mt7l9DWEIk",
  authDomain:        "estudobb-5c661.firebaseapp.com",
  projectId:         "estudobb-5c661",
  storageBucket:     "estudobb-5c661.firebasestorage.app",
  messagingSenderId: "819014974308",
  appId:             "1:819014974308:web:47c80ae9047741936d5871"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch(err => console.log('Persistence:', err.code));

export function checkAuth(redirectToLogin = true) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user && redirectToLogin) {
        window.location.href = 'https://estudobb.com.br/login?redirect=app';
      }
      resolve(user);
    });
  });
}

export { app };
