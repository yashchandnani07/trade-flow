
'use client';
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined') {
    if (!getApps().length) {
        try {
            app = initializeApp(firebaseConfig);
        } catch (e) {
            console.error("Failed to initialize Firebase", e);
        }
    } else {
        app = getApp();
    }
    
    try {
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (e) {
        console.error("Failed to get Auth or Firestore instance", e)
    }
}

// @ts-ignore
export { app, db, auth };
