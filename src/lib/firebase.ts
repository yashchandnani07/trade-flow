// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE",
  measurementId: "PASTE_YOUR_MEASUREMENT_ID_HERE"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  if (firebaseConfig.apiKey === "PASTE_YOUR_API_KEY_HERE") {
    console.error("Firebase config is not set. Please update src/lib/firebase.ts with your project's credentials.");
  }
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

export { app, db };
