// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// =================================================================================
// IMPORTANT: YOU MUST REPLACE THESE VALUES WITH YOUR OWN FIREBASE PROJECT'S CONFIG
// =================================================================================
// To get your Firebase config:
// 1. Go to the Firebase Console: https://console.firebase.google.com/
// 2. Select your project.
// 3. Go to Project Settings (click the gear icon ⚙️).
// 4. In the "General" tab, scroll down to the "Your apps" section.
// 5. Click on the "Config" radio button to view your firebaseConfig object.
// 6. Copy the entire object and paste it here, replacing the placeholder below.
// =================================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCTaMprB7jYy600mLLagtTh83ZtHXGnqss",
  authDomain: "tradeflow-m8xdr.firebaseapp.com",
  projectId: "tradeflow-m8xdr",
  storageBucket: "tradeflow-m8xdr.firebasestorage.app",
  messagingSenderId: "1028755677401",
  appId: "1:1028755677401:web:19cf7dd81b9c0e48739ec8"
};


// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
