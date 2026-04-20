import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppColors, Gradients, Radius, Shadows, Spacing } from '../../constants/theme';
import { apiClient } from '../../services/api';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'upcoming', label: 'Sắp tới' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'AWAITING_PAYMENT':
      return { label: 'Chờ thanh toán', color: '#F59E0B', bg: '#FEF3C7', icon: 'wallet-outline' as const };
    case 'AWAITING_CONFIRMATION':
      return { label: 'Chờ xác nhận', color: '#8B5CF6', bg: '#EDE9FE', icon: 'hourglass-outline' as const };
    case 'PENDING':
      return { label: 'Chờ duyệt', color: AppColors.info, bg: AppColors.infoLight, icon: 'time-outline' as const };
    case 'CONFIRMED':
      return { label: 'Đã xác nhận', color: AppColors.success, bg: AppColors.successLight, icon: 'checkmark-circle-outline' as const };
    case 'CANCELLED':
      return { label: 'Đã hủy', color: AppColors.danger, bg: AppColors.dangerLight, icon: 'close-circle-outline' as const };
    case 'COMPLETED':
      return { label: 'Hoàn thành', color: AppColors.success, bg: AppColors.successLight, icon: 'home-outline' as const };
    default:
      return { label: status, color: AppColors.textSecondary, bg: AppColors.borderLight, icon: 'ellipsis-horizontal' as const };
  }
};

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      if (!isRefreshing) setIsLoading(true);
      const response = await apiClient.get('/bookings/my-bookings');
      if (response.data?.success) {
        setBookings(response.data.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMyBookings();
  };

  const filteredBookings = activeTab === 'all'
    ? bookings
    : bookings.filter((b) => {
      if (activeTab === 'upcoming') return ['PENDING', 'CONFIRMED', 'AWAITING_PAYMENT', 'AWAITING_CONFIRMATION'].includes(b.status);
      return b.status.toLowerCase() === activeTab.toLowerCase();
    });

  const renderBooking = ({ item }: { item: any }) => {
    const statusConfig = getStatusConfig(item.status);
    const roomImage = item.room?.images?.[0]?.url
      ? { uri: item.room.images[0].url }
      : require('../../assets/images/room1.jpg');

    return (
      <TouchableOpacity style={styles.bookingCard} activeOpacity={0.9}>
        <Image source={roomImage} style={styles.bookingImage} />
        <View style={styles.bookingInfo}>
          <View style={styles.bookingHeader}>
            <Text style={styles.bookingRoom} numberOfLines={1}>{item.room?.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>
          </View>

          <View style={styles.bookingLocationRow}>
            <Ionicons name="location-outline" size={13} color={AppColors.textSecondary} />
            <Text style={styles.bookingLocation}>{item.room?.location}</Text>
          </View>

          <View style={styles.bookingDateRow}>
            <Ionicons name="calendar-outline" size={13} color={AppColors.textSecondary} />
            <Text style={styles.bookingDate}>
              {new Date(item.checkInDate).toLocaleDateString('vi-VN')} → {new Date(item.checkOutDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>

          <View style={styles.bookingFooter}>
            <Text style={styles.bookingCode}>#{item.id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.bookingPrice}>{Number(item.totalPrice).toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <Text style={styles.headerTitle}>Lịch Sử Đặt Phòng</Text>
        <Text style={styles.headerSubtitle}>{bookings.length} đơn đặt phòng</Text>
      </LinearGradient>

      {/* Tab Filter */}
      <View style={styles.tabContainer}>
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tabList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === item.id && styles.tabActive]}
              onPress={() => setActiveTab(item.id)}
            >
              <Text style={[styles.tabText, activeTab === item.id && styles.tabTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[AppColors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={56} color={AppColors.textLight} />
            <Text style={styles.emptyTitle}>Chưa có đơn nào</Text>
            <Text style={styles.emptyDesc}>Các đơn đặt phòng của bạn sẽ xuất hiện tại đây</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  header: {
    paddingTop: 50, paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  tabContainer: { marginTop: Spacing.lg },
  tabList: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  tab: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: Radius.round, backgroundColor: '#fff',
    borderWidth: 1, borderColor: AppColors.border,
    marginRight: Spacing.sm,
  },
  tabActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  tabText: { fontSize: 13, fontWeight: '500', color: AppColors.textSecondary },
  tabTextActive: { color: '#fff', fontWeight: '600' },

  listContent: { padding: Spacing.lg, paddingBottom: Spacing.huge },

  bookingCard: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: Radius.lg, marginBottom: Spacing.md,
    overflow: 'hidden', ...Shadows.medium,
  },
  bookingImage: { width: 110, height: 140 },
  bookingInfo: { flex: 1, padding: Spacing.md, justifyContent: 'space-between' },
  bookingHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: Spacing.sm,
  },
  bookingRoom: {
    flex: 1, fontSize: 15, fontWeight: '700',
    color: AppColors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  bookingLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  bookingLocation: { fontSize: 12, color: AppColors.textSecondary },
  bookingDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  bookingDate: { fontSize: 12, color: AppColors.textSecondary },
  bookingFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 6,
  },
  bookingCode: { fontSize: 11, color: AppColors.textLight, fontWeight: '500' },
  bookingPrice: { fontSize: 15, fontWeight: 'bold', color: AppColors.accent },

  emptyState: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: AppColors.textPrimary, marginTop: Spacing.lg },
  emptyDesc: { fontSize: 14, color: AppColors.textSecondary, marginTop: Spacing.xs },
});
