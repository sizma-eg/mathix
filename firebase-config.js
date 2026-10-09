// Mathix - Firebase Configuration
// Project: mathix-2008

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCH--HkIXYn3qhXZ9TwRItZrnMOIx_lWXk",
  authDomain: "mathix-2008.firebaseapp.com",
  projectId: "mathix-2008",
  storageBucket: "mathix-2008.firebasestorage.app",
  messagingSenderId: "561805658834",
  appId: "1:561805658834:web:c1db8ebc2d415be9497b0b",
  measurementId: "G-XWHKQ72FM0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export for other pages
export {
  app,
  auth,
  db,
  firebaseConfig
};
