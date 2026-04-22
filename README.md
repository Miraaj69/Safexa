# 🛡️ Safexa — Industrial Safety Checklist App
### v2.0 — Full UI/UX Redesign

---

## 🔥 What Changed in v2.0

### 1. STRICT COLOR SYSTEM (Consistency Fix)
- **ONE accent**: `#4F7CFF` (primary blue) — used for active elements, FAB, tabs
- **Semantic only**: Green=done, Amber=pending, Red=overdue
- ❌ Removed: rainbow borders, random per-plant gradients, inconsistent glows
- ✅ Glow ONLY on FAB button and active tab pill (intentional, premium)
- Plant color dots = data indicators only, NOT decorative

### 2. VISUAL HIERARCHY (Every screen)
```
Dashboard hero:
  0%      ← 52px extrabold (hero element, eyes go here first)
  0/14    ← 18px semibold (medium)
  tasks   ← 13px muted (label, least important)
```

### 3. CARD DESIGN
```js
backgroundColor: 'rgba(255,255,255,0.04)',
borderRadius: 16,
borderWidth: 1,
borderColor: 'rgba(255,255,255,0.08)',
shadowOpacity: 0.18,
```
No glow on regular cards. Scale animation on press (0.97x).

### 4. FILTER UI FIX (Tasks Screen)
- Scrollable horizontal rows (no wrapping mess)
- Same height pills, uniform padding
- Plant chips use plant color when active (data-meaningful)
- Status chips use primary blue when active

### 5. FAB BUTTON UPGRADE
- Press animation: scale 0.88 + opacity 0.85
- Subtle glow ring behind FAB (only element with glow)
- Add Task form: category + priority fields added

### 6. REPORTS SCREEN
- Animated SVG compliance ring (1.1s smooth fill)
- Weekly bar chart (last 6 weeks trend)
- Smart insight banner ("Compliance up 15% vs last month!")
- Month navigator with prev/next arrows

### 7. SCHEDULE SCREEN
- Tap ripple effect on each row (Animated scale + bg flash)
- Edit icon (✎) visible on every row
- Frequency dropdown modal on tap

### 8. EMPTY STATE
- Contextual messages: "You're all caught up!" vs "No results found"

### 9. ADD FLOW (FAB Sheet)
- Add Task: Plant + Checklist + Priority + Remark
- Add Plant: Name + Code
- Add Checklist: Name + Category + Frequency (7 categories)

### 10. ANIMATIONS
- Screen entry: fade + slide (450ms)
- Card press: spring scale 0.97
- Tab switch: animated icon wrap highlight
- Compliance ring: SVG animated stroke (1s)

### 11. MICRO DETAILS
- Text opacity: title=100%, secondary=60%, muted=28% (strict)
- 8pt spacing grid: xs=4, sm=8, md=12, lg=16, xl=24, xxl=32
- Radius: sm=8, md=12, lg=16, xl=20, full=999

### 12. SETTINGS SCREEN (New Tab)
- Theme picker: Dark / Light / AMOLED (persisted to AsyncStorage)
- Notification toggles: Daily 8AM, Overdue alerts, Weekly summary
- Defaults: Default plant, frequency, auto-generation ON/OFF
- Data: Export PDF, Export Excel, Cloud backup, Restore, Clear all
- Security: App lock, Auto-lock timer
- Profile card, About section

---

## 📁 File Structure

```
Safexa/
├── App.js                     # Root — ThemeProvider wraps everything
├── index.js
├── app.json / package.json / babel.config.js
│
├── Constants_theme.js         # THEMES{dark,light,amoled} + SEMANTIC colors
├── Constants_data.js          # PLANTS, CHECKLISTS, FREQUENCIES, TASK_STATUS
├── Constants_equipments.js    # 15 PM equipment master
├── Constants_plants.js        # 7 plants + schedule mapping
├── Constants_initialState.js  # Initial app state
│
├── Context_AppContext.js      # Global state + task logic
├── Context_ThemeContext.js    # Theme switching (persisted)
│
├── Navigation_AppNavigator.js # 5-tab bottom nav + stack
│
├── Screens_HomeScreen.js      # Dashboard with animated ring
├── Screens_TasksScreen.js     # Filtered task list
├── Screens_TaskDetailScreen.js # Complete task + photo
├── Screens_ReportsScreen.js   # Animated ring + chart + insights
├── Screens_MasterScreen.js    # Checklists / Plants / Schedule
├── Screens_SettingsScreen.js  # 🆕 Theme + notifications + data
│
├── Components_UIComponents.js # Card, Button, Badge, StatusBadge, etc.
├── Components_TaskCard.js     # Swipeable task card
├── Components_FABSheet.js     # FAB + bottom sheet forms
│
└── Hooks_useTasks.js          # Task state hook
```

---

## 🚀 Setup

```bash
npm install
npx expo start
```

---

## 🎨 Theme System

```js
import { useTheme } from './Context_ThemeContext';

function MyComponent() {
  const { colors, theme, setTheme } = useTheme();
  // colors.bg, colors.text, colors.bgCard, etc.
  // theme: 'dark' | 'light' | 'amoled'
  // setTheme('amoled') — persists to AsyncStorage
}
```

---

## 🧠 Task Status Flow

```
Generated → PENDING → (swipe right / tap complete) → COMPLETED
                   → (missed, next day) → OVERDUE
```

Status values: `'pending'` | `'completed'` | `'overdue'`
