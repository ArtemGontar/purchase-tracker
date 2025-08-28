# Purchase Tracker Frontend Setup

## Project Structure & Initial Setup

This guide walks through setting up the minimal buildable React Native app for the Purchase Tracker MVP.

---

## 1. Repository Structure

```
purchase-tracker/
├── OVERVIEW.md
├── SETUP-FRONTEND.md
├── mobile/                     # React Native app
│   ├── package.json
│   ├── metro.config.js
│   ├── babel.config.js
│   ├── index.js
│   ├── app.json
│   ├── src/
│   │   ├── App.tsx
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── ScanScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── components/
│   │   │   ├── PurchaseCard.tsx
│   │   │   └── CameraView.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── services/
│   │       └── mockData.ts
│   ├── android/
│   └── ios/
└── docs/
    └── screenshots/            # App screenshots for documentation
```

---

## 2. Initial Setup Commands

### Prerequisites
- Node.js (v18+)
- React Native CLI
- Android Studio / Xcode (for device testing)

### Setup Steps

```bash
# 1. Initialize React Native project
cd purchase-tracker
npx react-native@latest init PurchaseTracker --directory mobile --template react-native-template-typescript

# 2. Navigate to mobile directory
cd mobile

# 3. Install required dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-vector-icons
npm install @types/react-native-vector-icons

# 4. For camera functionality (future)
npm install react-native-image-picker

# 5. For iOS (if developing on macOS)
cd ios && pod install && cd ..
```

---

## 3. Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.74.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "react-native-screens": "^3.29.0",
    "react-native-safe-area-context": "^4.8.0",
    "react-native-vector-icons": "^10.0.0",
    "react-native-image-picker": "^7.1.0"
  },
  "devDependencies": {
    "@types/react-native-vector-icons": "^6.4.0"
  }
}
```

---

## 4. Mock Data Structure

**Purchase Mock Data:**
```typescript
interface Purchase {
  id: string;
  date: string;
  storeName: string;
  total: number;
  items: PurchaseItem[];
  imageUrl?: string;
}

interface PurchaseItem {
  name: string;
  price: number;
  quantity: number;
}
```

**Sample Mock Data:**
```typescript
const mockPurchases: Purchase[] = [
  {
    id: '1',
    date: '2025-08-27T14:30:00Z',
    storeName: 'Carrefour',
    total: 15.67,
    items: [
      { name: 'Milk 1L', price: 1.20, quantity: 1 },
      { name: 'Bread', price: 0.80, quantity: 2 },
      { name: 'Apples 1kg', price: 2.50, quantity: 1 },
      { name: 'Chicken breast', price: 8.97, quantity: 1 }
    ]
  },
  {
    id: '2',
    date: '2025-08-26T10:15:00Z',
    storeName: 'Lidl',
    total: 7.32,
    items: [
      { name: 'Coffee', price: 3.99, quantity: 1 },
      { name: 'Bananas', price: 1.33, quantity: 1 },
      { name: 'Yogurt', price: 2.00, quantity: 1 }
    ]
  }
];
```

---

## 5. Minimal UI Components

### Bottom Tab Navigation
- **Home Tab** (📋): List of purchases
- **Scan Tab** (📸): Camera/scan receipt screen  
- **Profile Tab** (👤): User profile (minimal)

### Home Screen Features
- **Purchase Cards**: Display store, date, total
- **Pull-to-refresh**: Mock refresh animation
- **Empty state**: "No purchases yet" placeholder

### Scan Screen Features
- **Mock Camera View**: Placeholder with "Take Photo" button
- **Success Animation**: Simple "Receipt saved!" message
- **Fake Upload**: Simulates adding a new purchase to mock data

### Profile Screen Features
- **User Info**: Mock user name and email
- **Settings**: Toggle for notifications (non-functional)
- **About**: App version info

---

## 6. Development Workflow

### Run the App
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

### File Organization
```
src/
├── App.tsx                 # Main app component with navigation
├── navigation/
│   └── AppNavigator.tsx    # Bottom tab navigator
├── screens/
│   ├── HomeScreen.tsx      # Purchase list + empty state
│   ├── ScanScreen.tsx      # Mock camera + add purchase
│   └── ProfileScreen.tsx   # User info + settings
├── components/
│   ├── PurchaseCard.tsx    # Individual purchase item
│   └── CameraView.tsx      # Mock camera placeholder
├── types/
│   └── index.ts            # TypeScript interfaces
└── services/
    └── mockData.ts         # Sample purchase data
```

---

## 7. First Sprint Goals

**Week 1: Basic Structure**
- ✅ React Native app with TypeScript
- ✅ Bottom tab navigation
- ✅ Three main screens (Home, Scan, Profile)
- ✅ Mock data service

**Week 2: UI Polish**
- ✅ Purchase cards with real design
- ✅ Mock camera interface
- ✅ Loading states and animations
- ✅ Icon integration

**Week 3: Interactions**
- ✅ Add new purchase flow (mock)
- ✅ Purchase detail view
- ✅ Pull-to-refresh
- ✅ Basic state management

---

## 8. Testing the MVP

### Manual Testing Checklist
- [ ] App launches without crashes
- [ ] Navigation between tabs works
- [ ] Home screen shows mock purchases
- [ ] Scan screen shows camera placeholder
- [ ] "Take Photo" adds a new mock purchase
- [ ] Profile screen displays user info
- [ ] Pull-to-refresh works on home screen

### Screenshots to Capture
1. Home screen with purchase list
2. Empty state (no purchases)
3. Scan screen with camera placeholder
4. Profile screen
5. Purchase detail view

---

## 9. Next Steps (Backend Integration)

Once the frontend MVP is complete:
1. Replace mock data service with API calls
2. Integrate real camera functionality
3. Add photo upload to cloud storage
4. Implement user authentication
5. Connect to OCR service

---

## Quick Start Command

```bash
# One-liner to get started
cd purchase-tracker && npx react-native@latest init PurchaseTracker --directory mobile --template react-native-template-typescript
```

This setup provides a solid foundation for the Purchase Tracker MVP with a fully functional React Native app that can be built, run, and tested immediately.
