import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Habit, HabitCompletion } from '../../types';
import { getUserHabits, getHabitCompletions } from '../../services/firebase';

interface ProgressData {
  date: string;
  totalHabits: number;
  completedHabits: number;
  percentage: number;
}

const ProgressScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<ProgressData[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadProgressData();
    }
  }, [currentUser]);

  const loadProgressData = async () => {
    if (!currentUser) return;

    try {
      const userHabits = await getUserHabits(currentUser.uid);
      setHabits(userHabits);

      // Get progress for the last 7 days
      const progressData: ProgressData[] = [];
      const today = new Date();
      let streakCount = 0;
      let maxStreak = 0;
      let currentStreakActive = true;

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();

        // Get habits that should be done on this day
        const dayHabits = userHabits.filter(habit => 
          habit.daysOfWeek.includes(dayOfWeek)
        );

        // Get completions for this day
        const completions = await getHabitCompletions(currentUser.uid, dateString);
        const completedCount = completions.length;

        const percentage = dayHabits.length > 0 
          ? Math.round((completedCount / dayHabits.length) * 100)
          : 0;

        progressData.push({
          date: dateString,
          totalHabits: dayHabits.length,
          completedHabits: completedCount,
          percentage,
        });

        // Calculate streak
        if (percentage === 100 && dayHabits.length > 0) {
          if (currentStreakActive || i === 6) {
            streakCount++;
          }
        } else if (i === 6) {
          // Today - if not 100%, current streak is broken
          currentStreakActive = false;
          streakCount = 0;
        }

        maxStreak = Math.max(maxStreak, streakCount);
      }

      setWeeklyProgress(progressData);
      setCurrentStreak(currentStreakActive ? streakCount : 0);
      setBestStreak(maxStreak);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProgressData();
  };

  const getWeeklyAverage = () => {
    if (weeklyProgress.length === 0) return 0;
    const sum = weeklyProgress.reduce((acc, day) => acc + day.percentage, 0);
    return Math.round(sum / weeklyProgress.length);
  };

  const getTotalCompletions = () => {
    return weeklyProgress.reduce((acc, day) => acc + day.completedHabits, 0);
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNumber = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return '#10b981';
    if (percentage >= 75) return '#f59e0b';
    if (percentage >= 50) return '#f97316';
    if (percentage > 0) return '#ef4444';
    return '#e5e7eb';
  };

  const renderProgressBar = (percentage: number) => (
    <View style={styles.progressBarContainer}>
      <View 
        style={[
          styles.progressBarFill, 
          { 
            width: `${percentage}%`,
            backgroundColor: getProgressColor(percentage)
          }
        ]} 
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading your progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Track your habit-building journey</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="flame" size={24} color="#f97316" />
          </View>
          <Text style={styles.statNumber}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="trophy" size={24} color="#f59e0b" />
          </View>
          <Text style={styles.statNumber}>{bestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          </View>
          <Text style={styles.statNumber}>{getTotalCompletions()}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      {/* Weekly Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly Overview</Text>
          <Text style={styles.weeklyAverage}>{getWeeklyAverage()}% avg</Text>
        </View>

        <View style={styles.weeklyChart}>
          {weeklyProgress.map((day, index) => (
            <View key={day.date} style={styles.dayColumn}>
              <View style={styles.dayBar}>
                <View 
                  style={[
                    styles.dayBarFill,
                    {
                      height: `${day.percentage}%`,
                      backgroundColor: getProgressColor(day.percentage),
                    }
                  ]}
                />
              </View>
              <Text style={styles.dayPercentage}>{day.percentage}%</Text>
              <Text style={styles.dayName}>{getDayName(day.date)}</Text>
              <Text style={styles.dayNumber}>{getDayNumber(day.date)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Daily Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Breakdown</Text>
        
        {weeklyProgress.map((day) => (
          <View key={day.date} style={styles.dayBreakdown}>
            <View style={styles.dayInfo}>
              <Text style={styles.dayTitle}>
                {getDayName(day.date)} {getDayNumber(day.date)}
              </Text>
              <Text style={styles.dayStats}>
                {day.completedHabits} of {day.totalHabits} habits
              </Text>
            </View>
            <View style={styles.dayProgress}>
              {renderProgressBar(day.percentage)}
              <Text style={styles.dayPercentageText}>{day.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Motivational Section */}
      {currentStreak > 0 && (
        <View style={styles.motivationCard}>
          <Ionicons name="rocket" size={32} color="#6366f1" />
          <Text style={styles.motivationTitle}>
            {currentStreak === 1 
              ? "Great start! 🎉" 
              : `${currentStreak} days strong! 🔥`
            }
          </Text>
          <Text style={styles.motivationText}>
            {currentStreak < 3 
              ? "Keep going! Consistency is key to building lasting habits."
              : currentStreak < 7
              ? "You're building momentum! Your habits are becoming routine."
              : "Amazing! You're proving that small steps lead to big changes."
            }
          </Text>
        </View>
      )}

      {currentStreak === 0 && weeklyProgress.length > 0 && (
        <View style={styles.motivationCard}>
          <Ionicons name="heart" size={32} color="#ef4444" />
          <Text style={styles.motivationTitle}>Every day is a fresh start</Text>
          <Text style={styles.motivationText}>
            Don't worry about yesterday. Focus on what you can do today to build better habits.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  weeklyAverage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  weeklyChart: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayBar: {
    width: 24,
    height: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  dayBarFill: {
    width: '100%',
    borderRadius: 12,
    minHeight: 4,
  },
  dayPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  dayName: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 10,
    color: '#94a3b8',
  },
  dayBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dayInfo: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  dayStats: {
    fontSize: 14,
    color: '#64748b',
  },
  dayProgress: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  progressBarContainer: {
    width: 60,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  dayPercentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  motivationCard: {
    backgroundColor: 'white',
    margin: 24,
    marginTop: 0,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  motivationText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProgressScreen;