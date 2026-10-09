import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  initializeAuth,
  getAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCH--HkIXYn3qhXZ9TwRItZrnMOIx_lWXk",
  authDomain: "mathix-2008.firebaseapp.com",
  projectId: "mathix-2008",
  storageBucket: "mathix-2008.firebasestorage.app",
  messagingSenderId: "561805658834",
  appId: "1:561805658834:web:c1db8ebc2d415be9497b0b",
  measurementId: "G-XWHKQ72FM0"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;

try {
  auth = initializeAuth(app, {
    persistence: [
      indexedDBLocalPersistence,
      browserLocalPersistence,
      browserSessionPersistence
    ]
  });
} catch (error) {
  if (error.code === "auth/already-initialized") {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

const db = getFirestore(app);

const authReady = Promise.resolve(auth);

export { app, auth, db, authReady, firebaseConfig };
