
'use client';
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User as FirebaseUser,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { app, db, auth } from '@/lib/firebase';
import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { User, Role } from '@/lib/types';
import { FirebaseError } from 'firebase/app';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sendOtp: (phoneNumber: string, router: AppRouterInstance) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  signup: (otp: string, phoneNumber: string, additionalData: { role: Role; businessName: string }, router: AppRouterInstance) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserDocument = async (uid: string): Promise<Omit<User, 'uid' | 'phoneNumber'> | null> => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        return userDoc.data() as Omit<User, 'uid' | 'phoneNumber'>;
    }
    return null;
}

declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
        confirmationResult?: ConfirmationResult;
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const setupRecaptcha = useCallback(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
        }
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData = await fetchUserDocument(firebaseUser.uid);
        if (userData) {
            setUser({
                uid: firebaseUser.uid,
                phoneNumber: firebaseUser.phoneNumber,
                ...userData
            });
        } else {
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

  const sendOtp = async (phoneNumber: string, router: AppRouterInstance) => {
    try {
        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier!;
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;
    } catch(error) {
        console.error("Error sending OTP:", error);
        if (error instanceof FirebaseError) {
          if (error.code === 'auth/invalid-phone-number') {
            throw new Error('The phone number is not valid.');
          }
        }
        throw new Error('An unexpected error occurred while sending the OTP.');
    }
  }

  const verifyOtp = async (otp: string) => {
      if (!window.confirmationResult) {
          throw new Error("No confirmation result available. Please send OTP first.");
      }
      try {
          await window.confirmationResult.confirm(otp);
      } catch (error) {
          console.error("Error verifying OTP:", error);
          if (error instanceof FirebaseError && error.code === 'auth/invalid-verification-code') {
              throw new Error("The verification code is invalid. Please try again.");
          }
          throw new Error('Failed to verify OTP.');
      }
  }

  const signup = async (otp: string, phoneNumber: string, additionalData: { role: Role; businessName: string }, router: AppRouterInstance) => {
    if (!window.confirmationResult) {
          throw new Error("No confirmation result available. Please send OTP first.");
    }
    try {
      const userCredential = await window.confirmationResult.confirm(otp);
      const firebaseUser = userCredential.user;
      
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
        ...additionalData,
        phoneNumber,
        fssaiStatus: 'pending',
        location: null,
        createdAt: serverTimestamp(),
        points: 0,
      });

      // Let onAuthStateChanged handle setting user state, and then redirect
      if (additionalData.role === 'supplier') {
        router.push('/supplier-dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch(error) {
        if (error instanceof FirebaseError) {
          if (error.code === 'auth/invalid-verification-code') {
            throw new Error('The verification code is invalid.');
          }
        }
        throw new Error('An unexpected error occurred during signup.');
    }
  };

  const logout = async (router: AppRouterInstance) => {
    await signOut(auth);
    setUser(null);
    router.push('/');
  };

  const value = {
    user,
    loading,
    sendOtp,
    verifyOtp,
    signup,
    logout: (router: AppRouterInstance) => logout(router),
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
