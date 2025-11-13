import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCvQ4E-U_6AMAME0-vyO0i1UXZR7R2rYuc",
  authDomain: "sport-buddy-1c0b0.firebaseapp.com",
  projectId: "sport-buddy-1c0b0",
  storageBucket: "sport-buddy-1c0b0.appspot.com",
  messagingSenderId: "996123761993",
  appId: "1:996123761993:web:44247f36182e790381ce98"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

//  apiKey: "AIzaSyCvQ4E-U_6AMAME0-vyO0i1UXZR7R2rYuc",
//   authDomain: "sport-buddy-1c0b0.firebaseapp.com",
//   projectId: "sport-buddy-1c0b0",
//   storageBucket: "sport-buddy-1c0b0.firebasestorage.app",
//   messagingSenderId: "996123761993",
//   appId: "1:996123761993:web:44247f36182e790381ce98"