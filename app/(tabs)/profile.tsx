import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../constants/theme';

const MENU_ITEMS = [
  { icon: 'person-outline' as const, label: 'Thông tin cá nhân', color: '#3B82F6' },
  { icon: 'heart-outline' as const, label: 'Phòng yêu thích', color: '#EF4444' },
  { icon: 'card-outline' as const, label: 'Phương thức thanh toán', color: '#10B981' },
  { icon: 'notifications-outline' as const, label: 'Thông báo', color: '#F59E0B' },
  { icon: 'shield-checkmark-outline' as const, label: 'Bảo mật', color: '#8B5CF6' },
  { icon: 'language-outline' as const, label: 'Ngôn ngữ', color: '#06B6D4' },
  { icon: 'help-circle-outline' as const, label: 'Trung tâm hỗ trợ', color: '#6366F1' },
  { icon: 'star-outline' as const, label: 'Đánh giá ứng dụng', color: '#F59E0B' },
  { icon: 'information-circle-outline' as const, label: 'Về chúng tôi', color: '#64748B' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Avatar */}
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name || user?.email || 'K')[0].toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Ionicons name="camera" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user?.name || user?.email?.split('@')[0] || 'Khách hàng'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Đặt phòng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1.250</Text>
            <Text style={styles.statLabel}>Điểm thưởng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Gold</Text>
            <Text style={styles.statLabel}>Hạng thành viên</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Membership Card */}
      <View style={styles.membershipContainer}>
        <LinearGradient
          colors={['#D4A853', '#B8892F', '#8B6914']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.membershipCard}
        >
          <View style={styles.membershipHeader}>
            <View>
              <Text style={styles.membershipTitle}>LuxStay Gold</Text>
              <Text style={styles.membershipDesc}>Thành viên vàng</Text>
            </View>
            <Ionicons name="diamond" size={28} color="rgba(255,255,255,0.8)" />
          </View>
          <View style={styles.membershipFooter}>
            <Text style={styles.membershipPoints}>1.250 điểm</Text>
            <Text style={styles.membershipNext}>Còn 750 điểm để lên Platinum</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '62.5%' }]} />
          </View>
        </LinearGradient>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} activeOpacity={0.7}>
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

  membershipContainer: { marginHorizontal: Spacing.lg, marginTop: -Spacing.md },
  membershipCard: {
    borderRadius: Radius.lg, padding: Spacing.xl,
    ...Shadows.large,
  },
  membershipHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  membershipTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  membershipDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  membershipFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: Spacing.lg,
  },
  membershipPoints: { fontSize: 14, fontWeight: '600', color: '#fff' },
  membershipNext: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  progressBar: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3, marginTop: Spacing.sm, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },

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
