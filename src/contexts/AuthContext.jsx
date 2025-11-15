import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { addLog } from "../utils/logs";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // SIGN UP

  async function signup(name, email, password, sportInterest, city, skill) {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCred.user.uid;

    await setDoc(doc(db, "users", uid), {
      name,
      email,
      city,
      sportInterest,
      skill,
      role: "user",
      createdAt: serverTimestamp(),
    });

    await signOut(auth);
    return userCred;
  }

  // LOGIN

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    try {
      await addLog({
        actorUid: cred.user.uid,
        action: "login",
        targetCollection: "users",
        targetId: cred.user.uid,
        details: { email },
      });
    } catch (e) {
      console.warn("Login log failed", e);
    }

    return cred;
  }

  const logout = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // LOAD AUTH + PROFILE

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      
      if (user) {
        setAuthUser(user);

        try {
          const snap = await getDoc(doc(db, "users", user.uid));

          if (snap.exists()) {
            setProfile({ uid: user.uid, ...snap.data() }); 
          } else {
            setProfile(null);
          }
        } catch (e) {
          console.error("Profile load failed", e);
          setProfile(null);
        }
      } else {
        setAuthUser(null);
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    authUser,
    profile,
    signup,
    login,
    logout,
    resetPassword,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
