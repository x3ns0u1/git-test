import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Import screens (will create these next)
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import DailyRoutineScreen from '../screens/main/DailyRoutineScreen';
import HabitsScreen from '../screens/main/HabitsScreen';
import ProgressScreen from '../screens/main/ProgressScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import AddHabitScreen from '../screens/habits/AddHabitScreen';
import EditHabitScreen from '../screens/habits/EditHabitScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  DailyRoutine: undefined;
  Habits: undefined;
  Progress: undefined;
  Settings: undefined;
};

export type HabitStackParamList = {
  HabitsList: undefined;
  AddHabit: undefined;
  EditHabit: { habitId: string };
};

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const HabitStack = createStackNavigator<HabitStackParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
};

const HabitsNavigator = () => {
  return (
    <HabitStack.Navigator>
      <HabitStack.Screen 
        name="HabitsList" 
        component={HabitsScreen}
        options={{ title: 'My Habits' }}
      />
      <HabitStack.Screen 
        name="AddHabit" 
        component={AddHabitScreen}
        options={{ title: 'Add New Habit' }}
      />
      <HabitStack.Screen 
        name="EditHabit" 
        component={EditHabitScreen}
        options={{ title: 'Edit Habit' }}
      />
    </HabitStack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'DailyRoutine') {
            iconName = focused ? 'today' : 'today-outline';
          } else if (route.name === 'Habits') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <MainTab.Screen 
        name="DailyRoutine" 
        component={DailyRoutineScreen}
        options={{ tabBarLabel: 'Today' }}
      />
      <MainTab.Screen 
        name="Habits" 
        component={HabitsNavigator}
        options={{ tabBarLabel: 'Habits' }}
      />
      <MainTab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{ tabBarLabel: 'Progress' }}
      />
      <MainTab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </MainTab.Navigator>
  );
};

const AppNavigator = () => {
  const { currentUser } = useAuth();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <>
            <RootStack.Screen name="Auth" component={AuthNavigator} />
            <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;