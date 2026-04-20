import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth routes */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        
        {/* User tabs routes */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Admin routes */}
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        
        {/* Profile sub-screens */}
        <Stack.Screen name="profile" options={{ headerShown: false }} />

        {/* modal screen if needed */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </AuthProvider>
  );
}
