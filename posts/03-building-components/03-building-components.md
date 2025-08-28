---
title: "Building Components: From Boring Buttons to Receipt-Chomping Cards"
date: 2025-08-28
tags: [React Native, Components, UI/UX, TypeScript, Mobile Development]
description: "Learn to build reusable React Native components for your mobile app: cards, camera view, navigation, and mock data. UI/UX tips and TypeScript included for a robust MVP."
---

# Building Components: From Boring Buttons to Receipt-Chomping Cards 🧱🎨

Time to add some meat to our React Native skeleton! Today we're building the core components that'll make our Purchase Tracker actually track purchases (revolutionary, I know). Think of this as interior decorating, but for apps — and way more fun than picking out throw pillows.

## The Component Cast: Meet Your New Best Friends 🎭

We're building three main characters for our app:

1. **PurchaseCard** 💳 — The star of the show, displays purchase info
2. **CameraView** 📸 — The receipt scanner (currently fake, but it has dreams)
3. **Navigation** 🧭 — The GPS for our app (gets you where you need to go)

Let's dive in!

## PurchaseCard: The Receipt Whisperer 🧾✨

This little beauty turns boring purchase data into eye candy. It's like Marie Kondo for your receipts — everything has its place, and it sparks joy (or at least doesn't spark rage).

```tsx
// src/components/PurchaseCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Purchase } from '../types';

interface PurchaseCardProps {
  purchase: Purchase;
}

export const PurchaseCard: React.FC<PurchaseCardProps> = ({ purchase }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePress = () => {
    // Show purchase details in a popup
    const itemsList = purchase.items
      .map(item => `${item.quantity}x ${item.name} - $${item.price.toFixed(2)}`)
      .join('\n');
    
    Alert.alert(
      `${purchase.storeName} - $${purchase.total.toFixed(2)}`,
      `Date: ${formatDate(purchase.date)}\n\nItems:\n${itemsList}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.storeName}>{purchase.storeName}</Text>
        <Text style={styles.total}>${purchase.total.toFixed(2)}</Text>
      </View>
      <Text style={styles.date}>{formatDate(purchase.date)}</Text>
      <Text style={styles.itemCount}>
        {purchase.items.length} item{purchase.items.length !== 1 ? 's' : ''}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 12,
    color: '#999',
  },
});
```

**What makes this card special?**
- Tappable! (Shows purchase details)
- Pretty shadows (because flat is boring)
- Smart date formatting (no more ISO timestamp nightmares)
- Responsive design (works on tiny and huge screens)

## CameraView: The Fake-It-Till-You-Make-It Scanner 📸🎬

This component pretends to be a camera until we hook up the real thing. It's like a stunt double for our actual camera functionality — looks the part, does the job (sort of).

```tsx
// src/components/CameraView.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CameraViewProps {
  onTakePhoto: () => void;
  isLoading?: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({ 
  onTakePhoto, 
  isLoading = false 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.cameraText}>📸</Text>
        <Text style={styles.instructionText}>Point camera at receipt</Text>
        
        {/* The viewfinder frame */}
        <View style={styles.frame}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.captureButton, isLoading && styles.captureButtonDisabled]} 
        onPress={onTakePhoto}
        disabled={isLoading}
      >
        <Text style={styles.captureButtonText}>
          {isLoading ? 'Processing...' : 'Take Photo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  cameraText: {
    fontSize: 64,
    marginBottom: 16,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 32,
  },
  frame: {
    width: 250,
    height: 350,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#2196F3',
    borderWidth: 3,
    // Each corner has different border sides
  },
  // ... more corner styles for positioning
  captureButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 50,
    marginBottom: 50,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

**Why this works:**
- Looks legit (corners like a real camera app)
- Loading states (because users need feedback)
- Accessible (clear instructions and big buttons)
- Dark theme (because cameras are moody)

## Navigation: The App's GPS System 🗺️

Bottom tabs are the SUV of mobile navigation — practical, reliable, and everyone knows how to use them.

```tsx
// src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Scan') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
```

## The Mock Data Factory: Fake It Till You Make It 🏭

We need some fake purchases to test our components. Let's create a data service that pretends to be an API:

```tsx
// src/services/mockData.ts
import { Purchase } from '../types';

export const mockPurchases: Purchase[] = [
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
  // More mock data...
];

// Simulate API delay because real APIs aren't instant
export const fetchPurchases = (): Promise<Purchase[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockPurchases]);
    }, 800); // Fake loading time
  });
};
```

## Component Design Philosophy: KISS (Keep It Simple, Smarty) 💋

**Our component rules:**
1. **Single responsibility** — Each component does one thing well
2. **Predictable props** — Clear interfaces, no surprises
3. **Accessible** — Works for everyone, not just developers
4. **Testable** — Easy to test, easy to trust
5. **Reusable** — Write once, use everywhere

## Testing Your Components (The Reality Check) ✅

Here's how to make sure your components actually work:

```tsx
// Quick manual test checklist:
// ✅ PurchaseCard displays all info correctly
// ✅ Tapping shows purchase details
// ✅ CameraView looks like a camera
// ✅ "Take Photo" button responds
// ✅ Navigation switches between screens
// ✅ Loading states show properly
```

## What We Built vs. What We'll Build 🏗️

**Current status (MVP vibes):**
- Mock camera (looks real, acts fake)
- Static purchase data (no backend yet)
- Basic interactions (taps and alerts)
- Pretty UI (because ugly apps make people sad)

**Future upgrades (when we level up):**
- Real camera integration
- Actual OCR processing
- Cloud data storage
- Push notifications
- Dark mode (because we're fancy)

## Pro Tips for Component Success 🎯

1. **Start with mock data** — Build the UI first, worry about APIs later
2. **Use TypeScript** — Catch bugs before they catch you
3. **Think mobile-first** — Thumbs are bigger than cursors
4. **Test on real devices** — Simulators lie sometimes
5. **Keep it simple** — Complex components are hard to debug

## What's Next? 🚀

We've got our building blocks ready! Next up:
- Putting these components together into real screens
- Adding state management (when things get stateful)
- Connecting to a real backend (when we're feeling brave)

Remember: great apps are just collections of well-designed components that play nice together. We're building the Avengers of components here! 🦸‍♂️

---

**Component Status: ✅ Built and ready to assemble!**

Next post: We'll explore the magical world of Expo and how to test this masterpiece on every device you own (and some you don't). Stay tuned! 📱✨
