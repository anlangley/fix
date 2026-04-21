import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../constants/theme';
import { apiClient } from '../../services/api';

const MENU_ITEMS = [
  { icon: 'person-outline' as const, label: 'Thông tin cá nhân', color: '#3B82F6', route: '/profile/edit' },
  { icon: 'heart-outline' as const, label: 'Phòng yêu thích', color: '#EF4444', route: '/profile/favorites' },
  { icon: 'card-outline' as const, label: 'Phương thức thanh toán', color: '#10B981', route: '/profile/payment-methods' },
  { icon: 'mail-outline' as const, label: 'Hộp thư thông báo', color: '#8B5CF6', route: '/profile/notification-center' },
  { icon: 'notifications-outline' as const, label: 'Cài đặt thông báo', color: '#F59E0B', route: '/profile/notifications' },
  { icon: 'shield-checkmark-outline' as const, label: 'Bảo mật', color: '#8B5CF6', route: '/(auth)/change-password' },
  { icon: 'language-outline' as const, label: 'Ngôn ngữ', color: '#06B6D4', route: '/profile/language' },
  { icon: 'help-circle-outline' as const, label: 'Trung tâm hỗ trợ', color: '#6366F1', route: '/profile/help' },
  { icon: 'star-outline' as const, label: 'Đánh giá ứng dụng', color: '#F59E0B', route: 'rate' },
  { icon: 'information-circle-outline' as const, label: 'Về chúng tôi', color: '#64748B', route: '/profile/about' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalBookings: 0, confirmedBookings: 0, memberSince: '' });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchAvatar();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/auth/profile/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const fetchAvatar = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data?.success) {
        setAvatarUrl(res.data.data.user.avatarUrl || null);
      }
    } catch (error) {}
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleMenuPress = (item: typeof MENU_ITEMS[0]) => {
    if (item.route === 'rate') {
      // Mở trang đánh giá ứng dụng trên Store
      const storeUrl = Platform.OS === 'ios'
        ? 'https://apps.apple.com/app/luxstay/id123456789'
        : 'https://play.google.com/store/apps/details?id=com.luxstay.hotel';
      Alert.alert(
        'Đánh giá ứng dụng ⭐',
        'Cảm ơn bạn đã sử dụng LuxStay! Đánh giá 5 sao giúp chúng tôi phát triển tốt hơn.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đánh giá ngay', onPress: () => Linking.openURL(storeUrl) },
        ]
      );
      return;
    }
    router.push(item.route as any);
  };

  const formatMemberDate = (dateStr: string) => {
    if (!dateStr) return 'Mới';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Avatar */}
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.name || user?.email || 'K')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarBtn} onPress={() => router.push('/profile/edit' as any)}>
            <Ionicons name="camera" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user?.name || user?.email?.split('@')[0] || 'Khách hàng'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>

        {/* Stats Row — Dynamic */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalBookings}</Text>
            <Text style={styles.statLabel}>Đặt phòng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.confirmedBookings}</Text>
            <Text style={styles.statLabel}>Đã duyệt</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatMemberDate(stats.memberSince)}</Text>
            <Text style={styles.statLabel}>Tham gia</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => handleMenuPress(item)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={AppColors.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={AppColors.danger} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      <Text style={styles.version}>LuxStay v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  header: {
    paddingTop: 50, paddingBottom: Spacing.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
  },
  avatarContainer: { position: 'relative', marginBottom: Spacing.md },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: AppColors.accent,
  },
  avatarImage: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: AppColors.accent,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: -4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: AppColors.accent,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: Spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.lg, paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl, gap: Spacing.xl,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },

  menuContainer: {
    marginHorizontal: Spacing.lg, marginTop: Spacing.xxl,
    backgroundColor: '#fff', borderRadius: Radius.lg,
    ...Shadows.small,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg, gap: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: AppColors.borderLight,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: Radius.sm,
    justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: AppColors.textPrimary },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, marginHorizontal: Spacing.lg, marginTop: Spacing.xxl,
    backgroundColor: AppColors.dangerLight, borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: AppColors.danger },

  version: {
    textAlign: 'center', color: AppColors.textLight,
    fontSize: 12, marginVertical: Spacing.xxl,
  },
});
