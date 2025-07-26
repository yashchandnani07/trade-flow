
'use client';
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { app, db, auth } from '@/lib/firebase';
import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { User, Role } from '@/lib/types';
import { FirebaseError } from 'firebase/app';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signupWithPhone: (phoneNumber: string, password: string, additionalData: { role: Role; businessName: string }) => Promise<void>;
  loginWithPhone: (phoneNumber: string, password: string) => Promise<void>;
  logout: (router: AppRouterInstance) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserDocument = async (uid: string): Promise<Omit<User, 'uid'> | null> => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        return userDoc.data() as Omit<User, 'uid'>;
    }
    return null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData = await fetchUserDocument(firebaseUser.uid);
        if (userData) {
            setUser({
                uid: firebaseUser.uid,
                ...userData
            });
        } else {
            console.log("User exists in Auth but not in Firestore. Logging out.");
            await signOut(auth);
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signupWithPhone = async (phoneNumber: string, password: string, additionalData: { role: Role; businessName: string }) => {
    // Firebase doesn't support phone+password directly. We use the phone number as the email.
    // To make this work, we'll append a dummy domain.
    const email = `${phoneNumber}@tradeflow.app`;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userDocRef = doc(db, "users", firebaseUser.uid);
    await setDoc(userDocRef, {
        ...additionalData,
        email: firebaseUser.email, // Store the dummy email
        phoneNumber,
        fssaiStatus: 'pending',
        location: null,
        createdAt: serverTimestamp(),
        points: 0,
    });
  }

  const loginWithPhone = async (phoneNumber: string, password: string) => {
    const email = `${phoneNumber}@tradeflow.app`;
    await signInWithEmailAndPassword(auth, email, password);
  }

  const logout = async (router: AppRouterInstance) => {
    await signOut(auth);
    setUser(null);
    router.push('/');
  };

  const value = {
    user,
    loading,
    signupWithPhone,
    loginWithPhone,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
