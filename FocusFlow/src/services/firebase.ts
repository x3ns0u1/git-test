import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Habit, HabitCompletion, UserSettings, User } from '../types';

// Authentication Services
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// User Services
export const createUserProfile = async (user: FirebaseUser) => {
  try {
    const userProfile: Omit<User, 'id'> = {
      email: user.email!,
      displayName: user.displayName || undefined,
      createdAt: new Date(),
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    return userProfile;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Habit Services
export const createHabit = async (habit: Omit<Habit, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'habits'), {
      ...habit,
      createdAt: Timestamp.fromDate(habit.createdAt),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getUserHabits = async (userId: string): Promise<Habit[]> => {
  try {
    const q = query(
      collection(db, 'habits'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Habit[];
  } catch (error) {
    throw error;
  }
};

export const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
  try {
    const docRef = doc(db, 'habits', habitId);
    await updateDoc(docRef, updates);
  } catch (error) {
    throw error;
  }
};

export const deleteHabit = async (habitId: string) => {
  try {
    const docRef = doc(db, 'habits', habitId);
    await updateDoc(docRef, { isActive: false });
  } catch (error) {
    throw error;
  }
};

// Habit Completion Services
export const markHabitComplete = async (habitId: string, userId: string, date: string) => {
  try {
    const completion: Omit<HabitCompletion, 'id'> = {
      habitId,
      userId,
      date,
      completedAt: new Date(),
    };
    
    const docRef = await addDoc(collection(db, 'completions'), {
      ...completion,
      completedAt: Timestamp.fromDate(completion.completedAt),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getHabitCompletions = async (userId: string, date: string): Promise<HabitCompletion[]> => {
  try {
    const q = query(
      collection(db, 'completions'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      completedAt: doc.data().completedAt.toDate(),
    })) as HabitCompletion[];
  } catch (error) {
    throw error;
  }
};

// Settings Services
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const docRef = doc(db, 'settings', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserSettings;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
  try {
    const docRef = doc(db, 'settings', userId);
    await updateDoc(docRef, settings);
  } catch (error) {
    throw error;
  }
};

export const createDefaultSettings = async (userId: string) => {
  try {
    const defaultSettings: UserSettings = {
      userId,
      darkMode: false,
      minimalUI: false,
      fontSize: 'medium',
      soundEnabled: true,
      vibrationEnabled: true,
      reminderType: 'gentle',
    };
    
    await setDoc(doc(db, 'settings', userId), defaultSettings);
    return defaultSettings;
  } catch (error) {
    throw error;
  }
};