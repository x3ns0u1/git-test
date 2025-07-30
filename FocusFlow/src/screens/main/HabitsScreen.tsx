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
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import { Habit } from '../../types';
import { getUserHabits, deleteHabit } from '../../services/firebase';
import { HabitStackParamList } from '../../navigation/AppNavigator';

type HabitsScreenNavigationProp = StackNavigationProp<HabitStackParamList, 'HabitsList'>;

interface Props {
  navigation: HabitsScreenNavigationProp;
}

const HabitsScreen: React.FC<Props> = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadHabits();
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (currentUser) {
        loadHabits();
      }
    });

    return unsubscribe;
  }, [navigation, currentUser]);

  const loadHabits = async () => {
    if (!currentUser) return;

    try {
      const userHabits = await getUserHabits(currentUser.uid);
      setHabits(userHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
      Alert.alert('Error', 'Failed to load habits');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHabits();
  };

  const handleDeleteHabit = (habit: Habit) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habit.id);
              setHabits(prev => prev.filter(h => h.id !== habit.id));
              Alert.alert('Success', 'Habit deleted successfully');
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit');
            }
          },
        },
      ]
    );
  };

  const getTimeOfDayLabel = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning':
        return 'Morning';
      case 'afternoon':
        return 'Afternoon';
      case 'evening':
        return 'Evening';
      case 'any':
        return 'Anytime';
      default:
        return 'Anytime';
    }
  };

  const getDaysOfWeekLabel = (daysOfWeek: number[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (daysOfWeek.length === 7) return 'Daily';
    if (daysOfWeek.length === 5 && !daysOfWeek.includes(0) && !daysOfWeek.includes(6)) {
      return 'Weekdays';
    }
    if (daysOfWeek.length === 2 && daysOfWeek.includes(0) && daysOfWeek.includes(6)) {
      return 'Weekends';
    }
    return daysOfWeek.map(day => dayNames[day]).join(', ');
  };

  const renderHabitItem = (habit: Habit) => (
    <View key={habit.id} style={styles.habitItem}>
      <TouchableOpacity
        style={styles.habitContent}
        onPress={() => navigation.navigate('EditHabit', { habitId: habit.id })}
      >
        <View style={styles.habitHeader}>
          <View style={styles.habitIcon}>
            <Text style={styles.habitEmoji}>{habit.icon}</Text>
          </View>
          <View style={styles.habitInfo}>
            <Text style={styles.habitTitle}>{habit.title}</Text>
            <View style={styles.habitMeta}>
              <Text style={styles.habitMetaText}>
                {getTimeOfDayLabel(habit.timeOfDay)} • {getDaysOfWeekLabel(habit.daysOfWeek)}
              </Text>
            </View>
            {habit.startSmallReminder && (
              <Text style={styles.habitSubtitle}>{habit.startSmallReminder}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.habitActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditHabit', { habitId: habit.id })}
        >
          <Ionicons name="pencil" size={18} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteHabit(habit)}
        >
          <Ionicons name="trash" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading your habits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Habits</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddHabit')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first habit to start building better routines
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('AddHabit')}
            >
              <Text style={styles.createButtonText}>Create Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.habitsList}>
            {habits.map(renderHabitItem)}
          </View>
        )}
      </ScrollView>
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  habitsList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  habitItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  habitContent: {
    flex: 1,
    padding: 16,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  habitMeta: {
    marginBottom: 4,
  },
  habitMetaText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  habitSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  habitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    marginTop: 64,
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
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HabitsScreen;