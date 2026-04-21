# 🛡️ Safety Checklist App

Industrial safety equipment checklist tracker for AVTL & CRL plants.

## 📁 Project Structure

```
SafetyChecklist/
├── App.js                        # Root component
├── index.js                      # Entry point
├── app.json                      # Expo config
├── package.json                  # Dependencies
├── babel.config.js               # Babel config
├── initialState.js               # Default state
│
├── assets/                       # Icons, splash screen
│
├── constants/
│   ├── equipments.js             # 15 equipment master data
│   ├── plants.js                 # 7 plants + schedule mapping
│   └── theme.js                  # Colors, spacing, typography
│
├── context/
│   ├── AppContext.js             # Global state (tasks, filters)
│   └── ThemeContext.js           # Theme provider
│
├── navigation/
│   └── AppNavigator.js           # Bottom tab + stack navigator
│
├── screens/
│   ├── HomeScreen.js             # Dashboard (compliance ring, stats)
│   ├── TasksScreen.js            # Task list with filters
│   ├── TaskDetailScreen.js       # Complete task (photo + remarks)
│   ├── ReportsScreen.js          # Monthly compliance reports
│   └── MasterScreen.js           # Equipment + plant master data
│
├── components/
│   ├── TaskCard.js               # Reusable task card
│   ├── ScoreRing.js              # Animated compliance ring
│   ├── StatCard.js               # Stat metric card
│   ├── PlantCard.js              # Plant overview card
│   └── UIComponents.js           # Shared UI elements
│
└── utils/
    ├── taskGenerator.js          # 🧠 Core: auto-generate daily tasks
    ├── notifications.js          # Push notification setup
    ├── helpers.js                # Date, formatting utilities
    ├── storage.js                # AsyncStorage wrapper + offline queue
    └── firebase.js               # Firebase config + helpers
```

## 🚀 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup
Edit `utils/firebase.js` and replace:
```js
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

### 3. Run
```bash
npx expo start
```

## 🧠 Core Logic — Task Auto-Generation

```
Today = 21 April 2026 (Week 3, Month 4)

AVTL2 + DCP (Quarterly: Jan/Apr/Jul/Oct, Week 1)
  → Month 4 ✅, but Week 1 ≠ Week 3 ❌ → NOT due

AVTL2 + Emergency Siren (Monthly, Week 1)
  → Month = ALL ✅, but Week 1 ≠ Week 3 ❌ → NOT due

AVTL2 + Emergency Safety Shower (Weekly, Weeks 1,2,3)
  → Month = ALL ✅, Week 3 ✅ → DUE ✅
```

## 🎨 Color System
| Color  | Meaning |
|--------|---------|
| 🔴 Red | Overdue |
| 🟡 Amber | Pending / Due today |
| 🟢 Green | Completed |
| 🔵 Blue | Accent / AVTL2 |

## 📊 Frequency Logic
| Code | Frequency | Check interval |
|------|-----------|----------------|
| W    | Weekly    | Every week |
| M    | Monthly   | Specific week of month |
| Q    | Quarterly | Jan/Apr/Jul/Oct (or Feb/May/Aug/Nov etc.) |
| Y    | Yearly    | Specific month |

## 📱 Features
- ✅ Auto-generate daily tasks based on plant schedule
- ✅ Mark complete with photo proof + remarks
- ✅ Overdue detection (previous day tasks auto-marked)
- ✅ Offline support (AsyncStorage)
- ✅ Firebase sync (when online)
- ✅ Monthly compliance reports
- ✅ Plant-wise performance tracking
- ✅ Export/share reports
- ✅ Push notifications (8 AM + 4 PM daily)
- ✅ 7 plants × 15 equipment = full coverage
