import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

interface FirebaseInitialization {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const firebaseConfig: FirebaseInitialization = {
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
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
