import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAp9_qurmvthIIxy4_Hi_VoKRt5snfkZ8k",
  authDomain: "truckproject-8e5e8.firebaseapp.com",
  projectId: "truckproject-8e5e8",
  storageBucket: "truckproject-8e5e8.firebasestorage.app",
  messagingSenderId: "144627799852",
  appId: "1:144627799852:web:88e567ca85add489c27e89",
  measurementId: "G-PE2CSPTH9D"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
