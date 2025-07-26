// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTaMprB7jYy600mLLagtTh83ZtHXGnqss",
  authDomain: "tradeflow-m8xdr.firebaseapp.com",
  projectId: "tradeflow-m8xdr",
  storageBucket: "tradeflow-m8xdr.appspot.com",
  messagingSenderId: "1028755677401",
  appId: "1:1028755677401:web:19cf7dd81b9c0e48739ec8"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
