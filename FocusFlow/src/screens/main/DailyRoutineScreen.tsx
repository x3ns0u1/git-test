import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../../contexts/AuthContext';
import { Habit, HabitCompletion } from '../../types';
import { getUserHabits, getHabitCompletions, markHabitComplete } from '../../services/firebase';

interface HabitWithCompletion extends Habit {
  isCompleted: boolean;
}

const DailyRoutineScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const [habits, setHabits] = useState<HabitWithCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const currentDay = new Date().getDay(); // 0-6, Sunday-Saturday

  useEffect(() => {
    if (currentUser) {
      loadHabits();
    }
  }, [currentUser]);

  const loadHabits = async () => {
    if (!currentUser) return;

    try {
      const [userHabits, completions] = await Promise.all([
        getUserHabits(currentUser.uid),
        getHabitCompletions(currentUser.uid, today),
      ]);

      // Filter habits for today and mark completed ones
      const todayHabits = userHabits
        .filter(habit => habit.daysOfWeek.includes(currentDay))
        .map(habit => ({
          ...habit,
          isCompleted: completions.some(completion => completion.habitId === habit.id),
        }));

      setHabits(todayHabits);
      setCompletedToday(todayHabits.filter(h => h.isCompleted).length);
    } catch (error) {
      console.error('Error loading habits:', error);
      Alert.alert('Error', 'Failed to load habits');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleHabitToggle = async (habit: HabitWithCompletion) => {
    if (!currentUser || habit.isCompleted) return;

    try {
      await markHabitComplete(habit.id, currentUser.uid, today);
      
      // Update local state
      setHabits(prev => 
        prev.map(h => 
          h.id === habit.id ? { ...h, isCompleted: true } : h
        )
      );
      setCompletedToday(prev => prev + 1);

      // Show celebration
      Alert.alert('Great job! 🎉', `You completed "${habit.title}"!`);
    } catch (error) {
      console.error('Error marking habit complete:', error);
      Alert.alert('Error', 'Failed to mark habit as complete');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHabits();
  };

  const getTimeOfDayHabits = (timeOfDay: string) => {
    return habits.filter(habit => habit.timeOfDay === timeOfDay || habit.timeOfDay === 'any');
  };

  const getProgressPercentage = () => {
    if (habits.length === 0) return 0;
    return Math.round((completedToday / habits.length) * 100);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderHabitItem = (habit: HabitWithCompletion) => (
    <TouchableOpacity
      key={habit.id}
      style={[styles.habitItem, habit.isCompleted && styles.completedHabit]}
      onPress={() => handleHabitToggle(habit)}
      disabled={habit.isCompleted}
    >
      <View style={styles.habitIcon}>
        <Text style={styles.habitEmoji}>{habit.icon}</Text>
      </View>
      
      <View style={styles.habitContent}>
        <Text style={[styles.habitTitle, habit.isCompleted && styles.completedText]}>
          {habit.title}
        </Text>
        {habit.startSmallReminder && (
          <Text style={styles.habitSubtitle}>{habit.startSmallReminder}</Text>
        )}
      </View>

      <View style={styles.habitCheck}>
        {habit.isCompleted ? (
          <Animatable.View animation="bounceIn" duration={600}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          </Animatable.View>
        ) : (
          <View style={styles.uncheckedCircle} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTimeSection = (title: string, timeOfDay: string, icon: string) => {
    const timeHabits = getTimeOfDayHabits(timeOfDay);
    if (timeHabits.length === 0) return null;

    return (
      <View style={styles.timeSection}>
        <View style={styles.timeSectionHeader}>
          <Ionicons name={icon as any} size={20} color="#6366f1" />
          <Text style={styles.timeSectionTitle}>{title}</Text>
        </View>
        {timeHabits.map(renderHabitItem)}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading your habits...</Text>
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
        <Text style={styles.greeting}>{getGreeting()}!</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}</Text>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <Text style={styles.progressPercentage}>{getProgressPercentage()}%</Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} 
          />
        </View>
        
        <Text style={styles.progressText}>
          {completedToday} of {habits.length} habits completed
        </Text>
      </View>

      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No habits for today</Text>
          <Text style={styles.emptySubtitle}>
            Add some habits to get started on your journey!
          </Text>
        </View>
      ) : (
        <>
          {renderTimeSection('Morning', 'morning', 'sunny-outline')}
          {renderTimeSection('Afternoon', 'afternoon', 'partly-sunny-outline')}
          {renderTimeSection('Evening', 'evening', 'moon-outline')}
          {renderTimeSection('Anytime', 'any', 'time-outline')}
        </>
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#64748b',
  },
  progressCard: {
    backgroundColor: 'white',
    margin: 24,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
  },
  timeSection: {
    marginBottom: 24,
  },
  timeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  timeSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  completedHabit: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitEmoji: {
    fontSize: 20,
  },
  habitContent: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  habitSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  habitCheck: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    marginTop: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default DailyRoutineScreen;