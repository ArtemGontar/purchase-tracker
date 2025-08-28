# Purchase Tracker Mobile App

## Overview

This is the React Native mobile application for the Purchase Tracker MVP. The app allows users to scan receipts and track their purchases.

## Features

- 📱 **Cross-platform**: Built with Expo for iOS and Android
- 📋 **Purchase List**: View all your scanned receipts
- 📸 **Receipt Scanning**: Mock camera interface for receipt capture
- 👤 **User Profile**: Simple profile management
- 🔄 **Pull to Refresh**: Refresh purchase list
- 📱 **Bottom Tab Navigation**: Easy navigation between screens

## Tech Stack

- **React Native** with TypeScript
- **Expo** for development and building
- **React Navigation** for navigation
- **Expo Vector Icons** for icons

## Getting Started

### Prerequisites

- Node.js (v18+)
- Expo CLI
- Expo Go app on your phone (for testing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Scan the QR code with Expo Go (Android) or Camera app (iOS)

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Open on Android device/emulator
- `npm run ios` - Open on iOS device/simulator (macOS only)
- `npm run web` - Open in web browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── PurchaseCard.tsx # Individual purchase display
│   └── CameraView.tsx   # Mock camera interface
├── screens/             # Main app screens
│   ├── HomeScreen.tsx   # Purchase list
│   ├── ScanScreen.tsx   # Receipt scanning
│   └── ProfileScreen.tsx# User profile
├── navigation/          # Navigation configuration
│   └── AppNavigator.tsx # Bottom tab navigator
├── services/            # Data services
│   └── mockData.ts     # Mock API and data
├── types/              # TypeScript type definitions
│   └── index.ts        # App interfaces
└── index.ts            # Barrel exports
```

## Mock Data

The app currently uses mock data to simulate the backend API. The mock service includes:

- Sample purchase data
- Simulated API delays
- Mock receipt generation
- Local state management

## Testing

### Manual Testing Checklist

- [ ] App launches without crashes
- [ ] Navigation between tabs works
- [ ] Home screen shows purchase list
- [ ] Pull to refresh works
- [ ] Scan screen shows camera interface
- [ ] "Take Photo" adds new purchase
- [ ] Purchase cards show details on tap
- [ ] Profile screen displays user info
- [ ] Settings toggles work
- [ ] Logout confirmation works

### Test Data

The app includes 3 sample purchases:
1. Carrefour - $15.67 (4 items)
2. Lidl - $7.32 (3 items)  
3. Auchan - $23.45 (6 items)

## Development Notes

### Current Implementation

- **Mock camera**: Placeholder UI that generates random receipts
- **Local state**: No persistent storage yet
- **Fake API**: Simulated network delays and responses
- **Basic UI**: Minimal design focused on functionality

### Next Steps

1. **Backend Integration**
   - Replace mock data with real API calls
   - Add user authentication
   - Implement photo upload to cloud storage

2. **Camera Integration**
   - Add real camera functionality
   - Implement receipt cropping
   - Add photo preview

3. **Enhanced UI**
   - Add loading states
   - Improve animations
   - Add error handling
   - Dark mode support

4. **Data Persistence**
   - Add offline storage
   - Implement caching
   - Add sync functionality

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **Package conflicts**: Delete `node_modules` and `package-lock.json`, then `npm install`
3. **Platform-specific issues**: Check Expo documentation for device compatibility

### Package Version Warnings

The app may show warnings about package versions. These are usually safe to ignore for development but should be resolved before production.

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Add proper error handling
4. Test on both iOS and Android
5. Update this README for significant changes

---

Built with ❤️ using React Native & Expo
