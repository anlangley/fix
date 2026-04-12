import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { AppColors } from '../../constants/theme';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.background }}>
        <ActivityIndicator size="large" color={AppColors.accent} />
      </View>
    );
  }

  // Not logged in -> Auth
  if (!user) {
    return <Redirect href={"/(auth)/login" as any} />;
  }

  // Role Protection
  if (user.role !== 'ADMIN') {
    return <Redirect href={"/(tabs)" as any} />;
  }

  return (
    <Stack screenOptions={{
      headerShown: true,
      headerStyle: { backgroundColor: AppColors.primary },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '600' },
    }}>
       <Stack.Screen name="index" options={{ title: 'Admin Dashboard', headerShown: false }} />
       <Stack.Screen name="rooms" options={{ title: 'Quản lý Phòng' }} />
       <Stack.Screen name="users" options={{ title: 'Quản lý Users' }} />
       <Stack.Screen name="bookings" options={{ title: 'Quản lý Bookings' }} />
    </Stack>
  );
}
