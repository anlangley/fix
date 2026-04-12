import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../constants/theme';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'upcoming', label: 'Sắp tới' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
];

const MOCK_BOOKINGS = [
  {
    id: '1', room: 'Phòng Deluxe Ocean View', location: 'Đà Nẵng',
    checkIn: '15/04/2026', checkOut: '17/04/2026',
    price: '5.500.000đ', status: 'upcoming',
    image: require('../../assets/images/room1.jpg'),
    bookingCode: '#LUX-2026-0411',
  },
  {
    id: '2', room: 'Suite Tổng Thống', location: 'Hà Nội',
    checkIn: '01/03/2026', checkOut: '03/03/2026',
    price: '16.000.000đ', status: 'completed',
    image: require('../../assets/images/room2.jpg'),
    bookingCode: '#LUX-2026-0301',
  },
  {
    id: '3', room: 'Phòng Superior Garden', location: 'Hồ Chí Minh',
    checkIn: '10/02/2026', checkOut: '12/02/2026',
    price: '3.600.000đ', status: 'completed',
    image: require('../../assets/images/room3.jpg'),
    bookingCode: '#LUX-2026-0210',
  },
  {
    id: '4', room: 'Phòng Standard City View', location: 'Đà Lạt',
    checkIn: '25/01/2026', checkOut: '26/01/2026',
    price: '900.000đ', status: 'cancelled',
    image: require('../../assets/images/nn1.jpg'),
    bookingCode: '#LUX-2026-0125',
  },
  {
    id: '5', room: 'Royal Penthouse Suite', location: 'Phú Quốc',
    checkIn: '20/04/2026', checkOut: '23/04/2026',
    price: '45.000.000đ', status: 'upcoming',
    image: require('../../assets/images/nn2.jpg'),
    bookingCode: '#LUX-2026-0420',
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'upcoming':
      return { label: 'Sắp tới', color: AppColors.info, bg: AppColors.infoLight, icon: 'time-outline' as const };
    case 'completed':
      return { label: 'Hoàn thành', color: AppColors.success, bg: AppColors.successLight, icon: 'checkmark-circle-outline' as const };
    case 'cancelled':
      return { label: 'Đã hủy', color: AppColors.danger, bg: AppColors.dangerLight, icon: 'close-circle-outline' as const };
    default:
      return { label: status, color: AppColors.textSecondary, bg: AppColors.borderLight, icon: 'ellipsis-horizontal' as const };
  }
};

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState('all');

  const filteredBookings = activeTab === 'all'
    ? MOCK_BOOKINGS
    : MOCK_BOOKINGS.filter((b) => b.status === activeTab);

  const renderBooking = ({ item }: { item: typeof MOCK_BOOKINGS[0] }) => {
    const statusConfig = getStatusConfig(item.status);
    return (
      <TouchableOpacity style={styles.bookingCard} activeOpacity={0.9}>
        <Image source={item.image} style={styles.bookingImage} />
        <View style={styles.bookingInfo}>
          <View style={styles.bookingHeader}>
            <Text style={styles.bookingRoom} numberOfLines={1}>{item.room}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>
          </View>

          <View style={styles.bookingLocationRow}>
            <Ionicons name="location-outline" size={13} color={AppColors.textSecondary} />
            <Text style={styles.bookingLocation}>{item.location}</Text>
          </View>

          <View style={styles.bookingDateRow}>
            <Ionicons name="calendar-outline" size={13} color={AppColors.textSecondary} />
            <Text style={styles.bookingDate}>{item.checkIn} → {item.checkOut}</Text>
          </View>

          <View style={styles.bookingFooter}>
            <Text style={styles.bookingCode}>{item.bookingCode}</Text>
            <Text style={styles.bookingPrice}>{item.price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <Text style={styles.headerTitle}>Lịch Sử Đặt Phòng</Text>
        <Text style={styles.headerSubtitle}>{MOCK_BOOKINGS.length} đơn đặt phòng</Text>
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
