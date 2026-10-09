// Mathix — Firebase configuration
// Firebase Web API keys identify the project; access is controlled by Firebase Security Rules.
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
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

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Call once per page before using auth-dependent flows.
export const authReady = setPersistence(auth, browserLocalPersistence);
