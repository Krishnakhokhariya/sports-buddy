import React, { createContext, useContext, useEffect, useState, } from "react";
import { auth, db } from "../firebase";
import { addLog } from "../utils/logs";
import { serverTimestamp } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, extraProfile = {}) {
     const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    await setDoc(doc(db, "users", uid), {
      email,
      role: "user",
      createdAt:serverTimestamp(),
      ...extraProfile
    });
    await signOut(auth);

    return userCred;
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    try{
      await addLog({
        actorUid: cred.user.uid,
        action: 'login',
        targetCollection: 'users',
        targetId: cred.user.uid,
        details: {email},
      });
    } catch{
      console.warn('Login log failed',e);
    }
    return cred;
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
     console.log("Sending password reset for:", email);
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { currentUser, signup, login, logout, resetPassword };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
