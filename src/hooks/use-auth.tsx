
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
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { app, db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import type { User, Role } from '@/lib/types';
import { FirebaseError } from 'firebase/app';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, additionalData: { role: Role; businessName: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserDocument = async (uid: string): Promise<Omit<User, 'uid' | 'email'> | null> => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        return userDoc.data() as Omit<User, 'uid' | 'email'>;
    }
    return null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData = await fetchUserDocument(firebaseUser.uid);
        if (userData) {
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                ...userData
            });
        } else {
            // This case might happen if user document creation fails after signup
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

  const signup = async (email: string, password: string, additionalData: { role: Role; businessName: string }) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        const userDocRef = doc(db, "users", firebaseUser.uid);
        await setDoc(userDocRef, {
          ...additionalData,
          email,
          fssaiStatus: 'pending',
          location: null,
          createdAt: serverTimestamp()
        });
        // Manually set user after signup to trigger redirect
        const userData = await fetchUserDocument(firebaseUser.uid);
         if (userData) {
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                ...userData
            });
        }
    } catch(error) {
        if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
            throw new Error('This email address is already registered. Please try logging in instead.');
        }
        throw new Error('An unexpected error occurred during signup.');
    }
  };

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    const userData = await fetchUserDocument(firebaseUser.uid);
    if (userData) {
        setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userData
        });
    } else {
        // This case would be rare, but good to handle.
        await signOut(auth);
        setUser(null);
        throw new Error("User data not found in database.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    signup,
    login,
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
