import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../constants/theme';
import { apiClient } from '../../services/api';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    roomsCount: 0,
    bookingsToday: 0,
    monthlyRevenue: 0,
    usersCount: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (!isRefreshing) setIsLoading(true);
      
      // Lấy thống kê
      const statsRes = await apiClient.get('/admin/stats');
      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }

      // Lấy booking gần đây
      const bookingsRes = await apiClient.get('/bookings?limit=5');
      if (bookingsRes.data?.success) {
        setRecentBookings(bookingsRes.data.data.bookings);
      }
    } catch (error) {
      console.error('Fetch dashboard data failed:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return { color: AppColors.success, bg: AppColors.successLight, label: 'Xác nhận' };
      case 'PENDING': return { color: AppColors.warning, bg: AppColors.warningLight, label: 'Chờ duyệt' };
      case 'CANCELLED': return { color: AppColors.danger, bg: AppColors.dangerLight, label: 'Đã hủy' };
      default: return { color: AppColors.textSecondary, bg: AppColors.borderLight, label: status };
    }
  };
  
  const STAT_CARDS = [
    { icon: 'bed-outline' as const, label: 'Tổng phòng', value: stats.roomsCount.toString(), color: '#3B82F6', bg: '#DBEAFE' },
    { icon: 'calendar-outline' as const, label: 'Booking hôm nay', value: stats.bookingsToday.toString(), color: '#10B981', bg: '#D1FAE5' },
    { icon: 'cash-outline' as const, label: 'Doanh thu tháng', value: `${(stats.monthlyRevenue / 1000000).toFixed(1)}M`, color: '#F59E0B', bg: '#FEF3C7' },
    { icon: 'people-outline' as const, label: 'Người dùng', value: stats.usersCount.toString(), color: '#8B5CF6', bg: '#EDE9FE' },
  ];

  const QUICK_ACTIONS = [
    { icon: 'bed-outline' as const, label: 'Quản lý Phòng', route: '/admin/rooms', color: '#3B82F6' },
    { icon: 'list-outline' as const, label: 'Quản lý Booking', route: '/admin/bookings', color: '#10B981' },
    { icon: 'people-outline' as const, label: 'Quản lý Users', route: '/admin/users', color: '#8B5CF6' },
  ];

  return (
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[AppColors.primary]} />
        }
      >
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

        {isLoading && !isRefreshing ? (
          <View style={{ padding: 50 }}>
            <ActivityIndicator size="large" color={AppColors.primary} />
          </View>
        ) : (
          <>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {STAT_CARDS.map((stat, idx) => (
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

              {recentBookings.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Chưa có booking nào gần đây</Text>
                </View>
              ) : (
                recentBookings.map((booking) => {
                  const statusStyle = getStatusStyle(booking.status);
                  return (
                    <View key={booking.id} style={styles.bookingCard}>
                      <View style={styles.bookingLeft}>
                        <View style={styles.bookingAvatar}>
                          <Text style={styles.bookingAvatarText}>
                            {booking.user?.name?.[0] || 'U'}
                          </Text>
                        </View>
                        <View style={{flex: 1}}>
                          <Text style={styles.bookingGuest}>{booking.user?.name || 'Khách'}</Text>
                          <Text style={styles.bookingRoom}>{booking.room?.name || 'Phòng'}</Text>
                          <Text style={styles.bookingDate}>
                            {new Date(booking.checkInDate).toLocaleDateString('vi-VN')}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.bookingRight}>
                        <Text style={styles.bookingAmount}>{Number(booking.totalPrice).toLocaleString('vi-VN')}đ</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                          <Text style={[styles.statusText, { color: statusStyle.color }]}>
                            {statusStyle.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
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
  emptyState: { 
    padding: Spacing.xl, alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: AppColors.borderLight, borderStyle: 'dashed',
  },
  emptyText: { fontSize: 14, color: AppColors.textSecondary },
});
