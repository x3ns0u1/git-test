# FocusFlow - ADHD-Friendly Habit Tracker

A mobile habit tracking app designed specifically for adults with ADHD and neurodivergence, focusing on gentle encouragement and executive function support.

## 🎯 Features

### Core MVP Features (V1)

#### 1. User Authentication
- Email + password authentication using Firebase Auth
- Option to skip login (local data with warning)
- Secure user profile management

#### 2. Habit Setup & Management
- Create habits with custom titles and emoji icons
- Set time of day preferences (Morning, Afternoon, Evening, Anytime)
- Choose specific days of the week
- Optional "Start Small" reminders for gentle encouragement
- Edit and delete existing habits

#### 3. Daily Routine View
- Visual layout organized by time of day
- Colorful habit cards with checkbox-style completion
- Simple tap to mark habits as complete
- Real-time progress tracking with percentage completion
- Celebration animations for completed habits

#### 4. Progress Tracking
- Daily progress rings showing completion percentage
- Weekly and monthly summaries
- Streak tracking with "Streak Saver" option
- Visual progress charts and statistics
- Motivational messages based on progress

#### 5. ADHD-Friendly Design
- Clean, uncluttered interface
- Customizable settings (Dark mode, Minimal UI, Font size)
- Gentle reminder system with no guilt
- Progress over perfection philosophy
- Celebration of small wins

#### 6. User Settings
- Dark mode toggle
- Minimal UI option for better focus
- Font size adjustment
- Sound and vibration preferences
- Reminder style customization
- Account management

## 🛠 Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Authentication, Firestore, Cloud Messaging)
- **Navigation**: React Navigation v6
- **UI Components**: React Native Paper, Expo Vector Icons
- **Animations**: React Native Animatable
- **Language**: TypeScript

## 📱 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase project

### 1. Clone the Repository
```bash
git clone <repository-url>
cd FocusFlow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Configuration
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Cloud Messaging
5. Get your Firebase config object
6. Update `src/config/firebase.ts` with your Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 4. Run the App
```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## 🏗 Project Structure

```
FocusFlow/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Firebase configuration
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── navigation/
│   │   └── AppNavigator.tsx     # Main navigation setup
│   ├── screens/
│   │   ├── auth/                # Authentication screens
│   │   ├── main/                # Main app screens
│   │   └── habits/              # Habit management screens
│   ├── services/
│   │   └── firebase.ts          # Firebase service functions
│   └── types/
│       └── index.ts             # TypeScript type definitions
├── App.tsx                      # Main app component
└── package.json
```

## 🗃 Database Structure

### Firestore Collections

```
users/
  └── {userId}/
        ├── profile (email, displayName, createdAt)

habits/
  └── {habitId}/
        ├── userId
        ├── title
        ├── icon
        ├── timeOfDay
        ├── daysOfWeek[]
        ├── startSmallReminder
        ├── createdAt
        └── isActive

completions/
  └── {completionId}/
        ├── habitId
        ├── userId
        ├── date (YYYY-MM-DD)
        └── completedAt

settings/
  └── {userId}/
        ├── darkMode
        ├── minimalUI
        ├── fontSize
        ├── soundEnabled
        ├── vibrationEnabled
        └── reminderType
```

## 🎨 Design Philosophy

FocusFlow is built with ADHD and neurodivergent users in mind:

- **Progress over Perfection**: Celebrates small wins and doesn't punish missed days
- **Gentle Encouragement**: Uses positive reinforcement instead of guilt-based motivation
- **Visual Clarity**: Clean, uncluttered interface with clear visual hierarchy
- **Customization**: Adaptable to different sensory and cognitive preferences
- **Executive Function Support**: Reduces decision fatigue with smart defaults

## 🚀 Future Enhancements

- Push notifications with customizable reminder styles
- Habit templates and suggestions
- Social features for accountability partners
- Integration with health apps
- Advanced analytics and insights
- Accessibility improvements
- Offline mode support

## 🤝 Contributing

This is an MVP version. Contributions are welcome! Please read the contributing guidelines and submit pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💜 Acknowledgments

Built with love for the ADHD and neurodivergent community. Every feature is designed to support executive function challenges and celebrate the unique strengths of neurodivergent minds.

---

**Remember**: Progress is not about perfection. Every small step counts! 🌟