import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { UserSettings } from '../../types';
import { getUserSettings, updateUserSettings } from '../../services/firebase';

const SettingsScreen: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadSettings();
    }
  }, [currentUser]);

  const loadSettings = async () => {
    if (!currentUser) return;

    try {
      const userSettings = await getUserSettings(currentUser.uid);
      if (userSettings) {
        setSettings(userSettings);
      } else {
        // Create default settings if none exist
        const defaultSettings: UserSettings = {
          userId: currentUser.uid,
          darkMode: false,
          minimalUI: false,
          fontSize: 'medium',
          soundEnabled: true,
          vibrationEnabled: true,
          reminderType: 'gentle',
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (!currentUser || !settings) return;

    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      await updateUserSettings(currentUser.uid, { [key]: value });
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting');
      // Revert the change
      setSettings(settings);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    icon: string,
    rightComponent: React.ReactNode
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color="#6366f1" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {rightComponent}
    </View>
  );

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  if (loading || !settings) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your FocusFlow experience</Text>
      </View>

      {/* Account Section */}
      {renderSectionHeader('Account')}
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name="person" size={20} color="#6366f1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Email</Text>
              <Text style={styles.settingSubtitle}>{currentUser?.email}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name="log-out" size={20} color="#ef4444" />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: '#ef4444' }]}>Sign Out</Text>
              <Text style={styles.settingSubtitle}>Sign out of your account</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      {/* Appearance Section */}
      {renderSectionHeader('Appearance')}
      <View style={styles.section}>
        {renderSettingItem(
          'Dark Mode',
          'Use dark theme throughout the app',
          'moon',
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => updateSetting('darkMode', value)}
            trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
            thumbColor={settings.darkMode ? '#ffffff' : '#ffffff'}
          />
        )}

        {renderSettingItem(
          'Minimal UI',
          'Reduce visual elements for better focus',
          'eye-off',
          <Switch
            value={settings.minimalUI}
            onValueChange={(value) => updateSetting('minimalUI', value)}
            trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
            thumbColor={settings.minimalUI ? '#ffffff' : '#ffffff'}
          />
        )}

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name="text" size={20} color="#6366f1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Font Size</Text>
              <Text style={styles.settingSubtitle}>
                {settings.fontSize === 'small' ? 'Small' : 
                 settings.fontSize === 'medium' ? 'Medium' : 'Large'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      {renderSectionHeader('Notifications')}
      <View style={styles.section}>
        {renderSettingItem(
          'Sound',
          'Play sounds for habit completions',
          'volume-high',
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => updateSetting('soundEnabled', value)}
            trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
            thumbColor={settings.soundEnabled ? '#ffffff' : '#ffffff'}
          />
        )}

        {renderSettingItem(
          'Vibration',
          'Vibrate for notifications and feedback',
          'phone-portrait',
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(value) => updateSetting('vibrationEnabled', value)}
            trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
            thumbColor={settings.vibrationEnabled ? '#ffffff' : '#ffffff'}
          />
        )}

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name="notifications" size={20} color="#6366f1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Reminder Style</Text>
              <Text style={styles.settingSubtitle}>
                {settings.reminderType === 'gentle' ? 'Gentle Nudge' :
                 settings.reminderType === 'urgent' ? 'Urgent Alert' : 'No Reminders'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      {renderSectionHeader('About')}
      <View style={styles.section}>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name="help-circle" size={20} color="#6366f1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Help & Support</Text>
              <Text style={styles.settingSubtitle}>Get help and contact support</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name="document-text" size={20} color="#6366f1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Privacy Policy</Text>
              <Text style={styles.settingSubtitle}>How we handle your data</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name="information-circle" size={20} color="#6366f1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Version</Text>
              <Text style={styles.settingSubtitle}>1.0.0 (MVP)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ADHD-Friendly Message */}
      <View style={styles.adhdMessage}>
        <Ionicons name="heart" size={24} color="#6366f1" />
        <Text style={styles.adhdTitle}>Built for Neurodivergent Minds</Text>
        <Text style={styles.adhdText}>
          FocusFlow is designed with ADHD and executive function challenges in mind. 
          Every feature prioritizes progress over perfection and celebrates small wins.
        </Text>
      </View>
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
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 32,
    marginBottom: 12,
    marginHorizontal: 24,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  adhdMessage: {
    backgroundColor: 'white',
    margin: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  adhdTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  adhdText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SettingsScreen;