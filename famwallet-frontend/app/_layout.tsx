// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import AuthProvider from './context/AuthContext'; // Default import

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        {/* Initial Route */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {/* Authentication Screens */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        {/* Protected Screens */}
        <Stack.Screen name="home" options={{ headerShown: false }} />
        {/* Fallback Screen */}
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
