export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  icon: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'any';
  daysOfWeek: number[]; // 0-6, Sunday-Saturday
  startSmallReminder?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  completedAt: Date;
}

export interface UserSettings {
  userId: string;
  darkMode: boolean;
  minimalUI: boolean;
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  reminderType: 'gentle' | 'urgent' | 'none';
}

export interface DailyProgress {
  date: string;
  totalHabits: number;
  completedHabits: number;
  percentage: number;
  streak: number;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'any';

export type ReminderType = 'gentle' | 'urgent' | 'none';