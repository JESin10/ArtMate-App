import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIYLEU2fecfYvbco7S2eHIorocm_bg0Vw",
  authDomain: "art-mate-app.firebaseapp.com",
  projectId: "art-mate-app",
  storageBucket: "art-mate-app.firebasestorage.app",
  messagingSenderId: "884131672414",
  appId: "1:884131672414:web:ed9abcb820e200acb05fcf",
  measurementId: "G-PGC9N2RKGJ",
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
