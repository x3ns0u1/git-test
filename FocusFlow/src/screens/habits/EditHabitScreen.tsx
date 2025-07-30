import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { TimeOfDay, Habit } from '../../types';
import { getUserHabits, updateHabit } from '../../services/firebase';
import { HabitStackParamList } from '../../navigation/AppNavigator';

type EditHabitScreenNavigationProp = StackNavigationProp<HabitStackParamList, 'EditHabit'>;
type EditHabitScreenRouteProp = RouteProp<HabitStackParamList, 'EditHabit'>;

interface Props {
  navigation: EditHabitScreenNavigationProp;
  route: EditHabitScreenRouteProp;
}

const EMOJI_OPTIONS = [
  '💪', '🏃', '📚', '🧘', '💧', '🥗', '😴', '🎯', '✍️', '🎵',
  '🌅', '🚶', '🧠', '❤️', '🌱', '☕', '🍎', '🏋️', '🎨', '📱',
];

const TIME_OPTIONS = [
  { value: 'morning', label: 'Morning', icon: 'sunny-outline' },
  { value: 'afternoon', label: 'Afternoon', icon: 'partly-sunny-outline' },
  { value: 'evening', label: 'Evening', icon: 'moon-outline' },
  { value: 'any', label: 'Anytime', icon: 'time-outline' },
];

const DAY_OPTIONS = [
  { value: 0, label: 'Sun', fullLabel: 'Sunday' },
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' },
];

const EditHabitScreen: React.FC<Props> = ({ navigation, route }) => {
  const { currentUser } = useAuth();
  const { habitId } = route.params;
  
  const [habit, setHabit] = useState<Habit | null>(null);
  const [title, setTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💪');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('any');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startSmallReminder, setStartSmallReminder] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHabit();
  }, []);

  const loadHabit = async () => {
    if (!currentUser) return;

    try {
      const habits = await getUserHabits(currentUser.uid);
      const foundHabit = habits.find(h => h.id === habitId);
      
      if (foundHabit) {
        setHabit(foundHabit);
        setTitle(foundHabit.title);
        setSelectedIcon(foundHabit.icon);
        setTimeOfDay(foundHabit.timeOfDay);
        setSelectedDays(foundHabit.daysOfWeek);
        setStartSmallReminder(foundHabit.startSmallReminder || '');
      } else {
        Alert.alert('Error', 'Habit not found', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Error loading habit:', error);
      Alert.alert('Error', 'Failed to load habit');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser || !habit) return;

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a habit title');
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }

    setSaving(true);
    try {
      await updateHabit(habit.id, {
        title: title.trim(),
        icon: selectedIcon,
        timeOfDay,
        daysOfWeek: selectedDays,
        startSmallReminder: startSmallReminder.trim() || undefined,
      });

      Alert.alert('Success', 'Habit updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Error', 'Failed to update habit');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const selectAllDays = () => {
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const selectWeekdays = () => {
    setSelectedDays([1, 2, 3, 4, 5]);
  };

  const selectWeekends = () => {
    setSelectedDays([0, 6]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading habit...</Text>
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.centerContainer}>
        <Text>Habit not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habit Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Drink 8 glasses of water"
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose an Icon</Text>
          <View style={styles.emojiGrid}>
            {EMOJI_OPTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiOption,
                  selectedIcon === emoji && styles.selectedEmoji,
                ]}
                onPress={() => setSelectedIcon(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time of Day</Text>
          <View style={styles.timeGrid}>
            {TIME_OPTIONS.map((time) => (
              <TouchableOpacity
                key={time.value}
                style={[
                  styles.timeOption,
                  timeOfDay === time.value && styles.selectedTime,
                ]}
                onPress={() => setTimeOfDay(time.value as TimeOfDay)}
              >
                <Ionicons 
                  name={time.icon as any} 
                  size={20} 
                  color={timeOfDay === time.value ? '#6366f1' : '#64748b'} 
                />
                <Text style={[
                  styles.timeText,
                  timeOfDay === time.value && styles.selectedTimeText,
                ]}>
                  {time.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Days of the Week</Text>
          
          <View style={styles.dayPresets}>
            <TouchableOpacity style={styles.presetButton} onPress={selectAllDays}>
              <Text style={styles.presetButtonText}>Daily</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetButton} onPress={selectWeekdays}>
              <Text style={styles.presetButtonText}>Weekdays</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetButton} onPress={selectWeekends}>
              <Text style={styles.presetButtonText}>Weekends</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dayGrid}>
            {DAY_OPTIONS.map((day) => (
              <TouchableOpacity
                key={day.value}
                style={[
                  styles.dayOption,
                  selectedDays.includes(day.value) && styles.selectedDay,
                ]}
                onPress={() => toggleDay(day.value)}
              >
                <Text style={[
                  styles.dayText,
                  selectedDays.includes(day.value) && styles.selectedDayText,
                ]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Small Reminder (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            A gentle reminder to keep it simple when starting out
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Just 2 minutes, Even 1 sip counts"
            value={startSmallReminder}
            onChangeText={setStartSmallReminder}
            maxLength={100}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedEmoji: {
    backgroundColor: '#e0e7ff',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  emojiText: {
    fontSize: 24,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedTime: {
    backgroundColor: '#e0e7ff',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  timeText: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 8,
    fontWeight: '500',
  },
  selectedTimeText: {
    color: '#6366f1',
  },
  dayPresets: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  presetButtonText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  dayGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  dayOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedDay: {
    backgroundColor: '#e0e7ff',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  dayText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default EditHabitScreen;