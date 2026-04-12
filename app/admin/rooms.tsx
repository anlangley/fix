import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Shadows, Radius, Spacing } from '../../constants/theme';

const ROOMS = [
  {
    id: '1', name: 'Phòng Deluxe Ocean View', type: 'Phòng Đôi',
    price: '2.500.000đ', status: 'available',
    image: require('../../assets/images/room1.jpg'), bookings: 45,
  },
  {
    id: '2', name: 'Suite Tổng Thống', type: 'Suite',
    price: '8.000.000đ', status: 'occupied',
    image: require('../../assets/images/room2.jpg'), bookings: 23,
  },
  {
    id: '3', name: 'Phòng Superior Garden', type: 'Phòng Đôi',
    price: '1.800.000đ', status: 'available',
    image: require('../../assets/images/room3.jpg'), bookings: 78,
  },
  {
    id: '4', name: 'Standard City View', type: 'Phòng Đơn',
    price: '900.000đ', status: 'maintenance',
    image: require('../../assets/images/nn1.jpg'), bookings: 102,
  },
  {
    id: '5', name: 'Royal Penthouse Suite', type: 'VIP',
    price: '15.000.000đ', status: 'occupied',
    image: require('../../assets/images/nn2.jpg'), bookings: 12,
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'available': return { label: 'Trống', color: AppColors.success, bg: AppColors.successLight };
    case 'occupied': return { label: 'Có khách', color: AppColors.info, bg: AppColors.infoLight };
    case 'maintenance': return { label: 'Bảo trì', color: AppColors.warning, bg: AppColors.warningLight };
    default: return { label: status, color: AppColors.textSecondary, bg: AppColors.borderLight };
  }
};

export default function AdminRoomsScreen() {
  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: AppColors.success }]}>
          <Text style={styles.summaryValue}>3</Text>
          <Text style={styles.summaryLabel}>Trống</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: AppColors.info }]}>
          <Text style={styles.summaryValue}>2</Text>
          <Text style={styles.summaryLabel}>Có khách</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: AppColors.warning }]}>
          <Text style={styles.summaryValue}>1</Text>
          <Text style={styles.summaryLabel}>Bảo trì</Text>
        </View>
      </View>

      <FlatList
        data={ROOMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const statusConfig = getStatusConfig(item.status);
          return (
            <TouchableOpacity style={styles.roomCard} activeOpacity={0.9}>
              <Image source={item.image} style={styles.roomImage} />
              <View style={styles.roomInfo}>
                <View style={styles.roomHeader}>
                  <Text style={styles.roomName} numberOfLines={1}>{item.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.roomType}>{item.type}</Text>
                <View style={styles.roomFooter}>
                  <Text style={styles.roomPrice}>{item.price}/đêm</Text>
                  <Text style={styles.roomBookings}>{item.bookings} lượt đặt</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  summaryRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg, gap: Spacing.sm,
  },
  summaryCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: Radius.sm,
    padding: Spacing.md, borderLeftWidth: 3, ...Shadows.small,
  },
  summaryValue: { fontSize: 22, fontWeight: 'bold', color: AppColors.textPrimary },
  summaryLabel: { fontSize: 12, color: AppColors.textSecondary },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  roomCard: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: Radius.md, marginBottom: Spacing.md,
    overflow: 'hidden', ...Shadows.small,
  },
  roomImage: { width: 100, height: 100 },
  roomInfo: { flex: 1, padding: Spacing.md, justifyContent: 'space-between' },
  roomHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 8,
  },
  roomName: { flex: 1, fontSize: 15, fontWeight: '700', color: AppColors.textPrimary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.xs },
  statusText: { fontSize: 11, fontWeight: '600' },
  roomType: { fontSize: 13, color: AppColors.textSecondary },
  roomFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  roomPrice: { fontSize: 14, fontWeight: '700', color: AppColors.accent },
  roomBookings: { fontSize: 12, color: AppColors.textLight },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: AppColors.accent, justifyContent: 'center',
    alignItems: 'center', ...Shadows.large,
  },
});
