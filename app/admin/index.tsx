import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../constants/theme';

const { width } = Dimensions.get('window');

const STATS = [
  { icon: 'bed-outline' as const, label: 'Tổng phòng', value: '48', color: '#3B82F6', bg: '#DBEAFE' },
  { icon: 'calendar-outline' as const, label: 'Booking hôm nay', value: '12', color: '#10B981', bg: '#D1FAE5' },
  { icon: 'cash-outline' as const, label: 'Doanh thu tháng', value: '245M', color: '#F59E0B', bg: '#FEF3C7' },
  { icon: 'people-outline' as const, label: 'Người dùng', value: '1.2K', color: '#8B5CF6', bg: '#EDE9FE' },
];

const QUICK_ACTIONS = [
  { icon: 'add-circle-outline' as const, label: 'Thêm Phòng', route: '/admin/rooms', color: '#3B82F6' },
  { icon: 'list-outline' as const, label: 'Quản lý Booking', route: '/admin/bookings', color: '#10B981' },
  { icon: 'people-outline' as const, label: 'Quản lý Users', route: '/admin/users', color: '#8B5CF6' },
  { icon: 'stats-chart-outline' as const, label: 'Báo cáo', route: '/admin/rooms', color: '#F59E0B' },
];

const RECENT_BOOKINGS = [
  { id: '1', guest: 'Nguyễn Văn A', room: 'Deluxe Ocean View', date: '11/04/2026', status: 'confirmed', amount: '5.5M' },
  { id: '2', guest: 'Trần Thị B', room: 'Suite Tổng Thống', date: '11/04/2026', status: 'pending', amount: '16M' },
  { id: '3', guest: 'Lê Minh C', room: 'Standard City View', date: '10/04/2026', status: 'confirmed', amount: '1.8M' },
  { id: '4', guest: 'Phạm Đức D', room: 'Family Deluxe', date: '10/04/2026', status: 'cancelled', amount: '3.2M' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return { color: AppColors.success, bg: AppColors.successLight, label: 'Xác nhận' };
      case 'pending': return { color: AppColors.warning, bg: AppColors.warningLight, label: 'Chờ duyệt' };
      case 'cancelled': return { color: AppColors.danger, bg: AppColors.dangerLight, label: 'Đã hủy' };
      default: return { color: AppColors.textSecondary, bg: AppColors.borderLight, label: status };
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#1B1F3B', '#2D325A'] as [string, string]} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerGreeting}>Xin chào, Admin 👋</Text>
            <Text style={styles.headerEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {STATS.map((stat, idx) => (
          <View key={idx} style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: stat.bg }]}>
              <Ionicons name={stat.icon} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.actionCard}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon} size={26} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Bookings */}
      <View style={[styles.section, { marginBottom: Spacing.huge }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Booking gần đây</Text>
          <TouchableOpacity onPress={() => router.push('/admin/bookings')}>
            <Text style={styles.seeAll}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>

        {RECENT_BOOKINGS.map((booking) => {
          const statusStyle = getStatusStyle(booking.status);
          return (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingLeft}>
                <View style={styles.bookingAvatar}>
                  <Text style={styles.bookingAvatarText}>
                    {booking.guest[0]}
                  </Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.bookingGuest}>{booking.guest}</Text>
                  <Text style={styles.bookingRoom}>{booking.room}</Text>
                  <Text style={styles.bookingDate}>{booking.date}</Text>
                </View>
              </View>
              <View style={styles.bookingRight}>
                <Text style={styles.bookingAmount}>{booking.amount}đ</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.color }]}>
                    {statusStyle.label}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  header: {
    paddingTop: 50, paddingBottom: Spacing.xxl, paddingHorizontal: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerGreeting: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerEmail: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  logoutBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg, marginTop: -Spacing.lg, gap: Spacing.md,
  },
  statCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: '#fff', borderRadius: Radius.lg,
    padding: Spacing.lg, ...Shadows.medium,
  },
  statIconContainer: {
    width: 44, height: 44, borderRadius: Radius.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
  },
  statValue: { fontSize: 28, fontWeight: 'bold', color: AppColors.textPrimary },
  statLabel: { fontSize: 13, color: AppColors.textSecondary, marginTop: 2 },

  section: { marginTop: Spacing.xxl, paddingHorizontal: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: AppColors.textPrimary, marginBottom: Spacing.md },
  seeAll: { fontSize: 14, color: AppColors.accent, fontWeight: '600' },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  actionCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: '#fff', borderRadius: Radius.lg,
    padding: Spacing.xl, alignItems: 'center', ...Shadows.small,
  },
  actionIcon: {
    width: 56, height: 56, borderRadius: Radius.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
  },
  actionLabel: { fontSize: 14, fontWeight: '600', color: AppColors.textPrimary, textAlign: 'center' },

  bookingCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: Radius.md,
    padding: Spacing.lg, marginBottom: Spacing.sm, ...Shadows.small,
  },
  bookingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.md },
  bookingAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: AppColors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  bookingAvatarText: { fontSize: 16, fontWeight: '700', color: AppColors.primary },
  bookingGuest: { fontSize: 14, fontWeight: '600', color: AppColors.textPrimary },
  bookingRoom: { fontSize: 12, color: AppColors.textSecondary },
  bookingDate: { fontSize: 11, color: AppColors.textLight },
  bookingRight: { alignItems: 'flex-end' },
  bookingAmount: { fontSize: 15, fontWeight: '700', color: AppColors.accent, marginBottom: 4 },
  statusBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.xs,
  },
  statusText: { fontSize: 10, fontWeight: '600' },
});
