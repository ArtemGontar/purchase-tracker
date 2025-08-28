---
title: "React Native Skeleton: From Zero to 'Hello World' Without Losing Your Sanity"
date: 2025-08-28
tags: [React Native, TypeScript, Setup, Mobile Development, Expo]
description: "Step-by-step guide to setting up a React Native + TypeScript app with Expo. Learn project structure, essential packages, and best practices for a clean mobile app skeleton."
---

# React Native Skeleton: From Zero to 'Hello World' Without Losing Your Sanity 📱💀

So you want to build a mobile app? Welcome to the club! Today we're setting up the bare bones of a React Native project — think of it as the skeleton that'll eventually grow into our Purchase Tracker beast. Don't worry, this skeleton is friendly and won't haunt your dreams (unlike some dependency conflicts I've seen).

## Why React Native? Because Life's Too Short for Two Codebases 🤷‍♂️

Let's be real: nobody wants to build the same app twice. React Native lets you write once and deploy everywhere — iOS, Android, and even web if you're feeling fancy. It's like having a universal remote for mobile development, except it actually works.

Plus, if you already know React, you're halfway there. If you don't... well, you're about to learn! 🚀

## What We're Installing (The Shopping List) 🛒

Here's what we need to get our skeleton walking:

### The Essential Trinity
```bash
# The holy trinity of mobile development
npx create-expo-app mobile --template blank-typescript
cd mobile
npm install @react-navigation/native @react-navigation/bottom-tabs
```

### The Supporting Cast
```bash
# Because navigation without screens is just... confusing
npm install react-native-screens react-native-safe-area-context

# Icons, because nobody likes text-only buttons
npm install @react-native-vector-icons/ionicons

# Camera stuff (for when we actually want to scan receipts)
npm install expo-image-picker
```

## The Hello World That Actually Says Hello 👋

Forget the boring "Hello World" — let's make something that has personality:

```tsx
// App.tsx - The main character of our story
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function App() {
  const [greetingCount, setGreetingCount] = React.useState(0);
  
  const greetings = [
    "Hello, World! 👋",
    "Sup, Universe! 🌍",
    "Hey there, Developer! 👨‍💻",
    "Greetings, Human! 🤖",
    "What's up, Code Warrior! ⚔️"
  ];

  const handlePress = () => {
    setGreetingCount((count) => (count + 1) % greetings.length);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Purchase Tracker</Text>
      <Text style={styles.subtitle}>MVP in Progress... 🚧</Text>
      
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.greeting}>
          {greetings[greetingCount]}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.hint}>
        Tap the greeting to cycle through messages!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  greeting: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
```

## Project Structure: Organized Chaos 📁

Here's how to keep your code from becoming a digital dumpster fire:

```
mobile/
├── src/                    # Where the magic happens
│   ├── components/         # Reusable UI bits
│   ├── screens/           # Full-screen components
│   ├── navigation/        # How users get around
│   ├── services/          # API calls and data stuff
│   ├── types/            # TypeScript definitions
│   └── utils/            # Helper functions
├── assets/               # Images, fonts, etc.
├── App.tsx              # The main boss
└── package.json         # Dependency party list
```

## TypeScript: Because You Like Your Bugs Found Early ✅

We're using TypeScript because catching bugs at compile time > finding them in production at 3 AM. Trust me on this one.

Create a simple type file to get started:

```tsx
// src/types/index.ts
export interface AppProps {
  title: string;
  subtitle?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

// More types will live here as we grow
```

## Running Your Masterpiece 🏃‍♂️

```bash
# Start the development server
npm start

# Open on Android (if you have an emulator)
npm run android

# Open on iOS (if you're on macOS)
npm run ios

# Open in web browser (because why not?)
npm run web
```

## Pro Tips for Skeleton Success 💀✨

1. **Keep it simple**: Start small, grow gradually
2. **Use TypeScript**: Your future self will thank you
3. **Organize early**: Good structure prevents headaches later
4. **Test often**: Run it early, run it often
5. **Have fun**: If you're not enjoying it, you're doing it wrong!

## What's Next? 🚀

Now that we have a working skeleton, we can start adding flesh to these bones:
- Navigation between screens
- Real components with actual functionality
- State management (when things get spicy)
- API integration (when we connect to the real world)

Remember: every great app started as a simple "Hello World" — even Instagram was probably just a button that said "Take Photo" at some point!

---

**Skeleton Status: ✅ Assembled and walking!**

Next up: We'll build the actual components that make our Purchase Tracker tick. Stay tuned! 🎬
