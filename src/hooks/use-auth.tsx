
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
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { User, Role } from '@/lib/types';
import { FirebaseError } from 'firebase/app';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signupWithPhone: (phoneNumber: string, password: string, additionalData: { role: Role; businessName: string }) => Promise<void>;
  loginWithPhone: (phoneNumber: string, password: string) => Promise<void>;
  logout: (router: AppRouterInstance) => Promise<void>;
  switchUserRole: (newRole: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserDocument = async (uid: string): Promise<Omit<User, 'uid'> | null> => {
    if (!db) return null;
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
  const { toast } = useToast();
  
  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userData = await fetchUserDocument(firebaseUser.uid);
        if (userData) {
            setUser({
                uid: firebaseUser.uid,
                ...userData
            });
        } else {
            // This case can happen if a user is created in Auth but the Firestore doc creation fails.
            // Or if a user is deleted from Firestore but not from Auth.
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
    if (!auth || !db) throw new Error("Firebase not initialized");
    const email = `${phoneNumber}@tradeflow.app`;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userDocRef = doc(db, "users", firebaseUser.uid);
    
    const newUserBadges = [];
    if(additionalData.role === 'supplier') {
        newUserBadges.push({
            name: 'Newly Joined',
            dateAwarded: Timestamp.now()
        });
    }

    await setDoc(userDocRef, {
        ...additionalData,
        email: firebaseUser.email,
        phoneNumber,
        fssaiStatus: 'pending',
        location: null,
        createdAt: serverTimestamp(),
        points: 0,
        badges: newUserBadges,
    });
  }

  const loginWithPhone = async (phoneNumber: string, password: string) => {
    if (!auth) throw new Error("Firebase not initialized");
    const email = `${phoneNumber}@tradeflow.app`;
    await signInWithEmailAndPassword(auth, email, password);
  }

  const logout = async (router: AppRouterInstance) => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    router.push('/');
  };

  const switchUserRole = async (newRole: Role) => {
    if (!user || !db) {
        toast({ variant: 'destructive', title: 'Not authenticated or DB not available' });
        return;
    }
    setLoading(true);
    try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { role: newRole });
        setUser(prevUser => prevUser ? { ...prevUser, role: newRole } : null);
        toast({ title: 'Role Switched', description: `You are now a ${newRole}. Redirecting...` });
        // The redirect will be handled by the layout component
    } catch (error) {
        console.error("Error switching role:", error);
        toast({ variant: 'destructive', title: 'Error switching role' });
    } finally {
        setLoading(false);
    }
  }

  const value = {
    user,
    loading,
    signupWithPhone,
    loginWithPhone,
    logout,
    switchUserRole,
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
