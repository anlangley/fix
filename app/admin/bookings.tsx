import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Shadows, Radius, Spacing } from '../../constants/theme';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'confirmed', label: 'Xác nhận' },
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'cancelled', label: 'Đã hủy' },
];

const BOOKINGS = [
  { id: '1', guest: 'Nguyễn Văn A', email: 'vana@email.com', room: 'Deluxe Ocean View', checkIn: '15/04/2026', checkOut: '17/04/2026', amount: '5.500.000đ', status: 'confirmed', guests: 2 },
  { id: '2', guest: 'Trần Thị B', email: 'thib@email.com', room: 'Suite Tổng Thống', checkIn: '18/04/2026', checkOut: '20/04/2026', amount: '16.000.000đ', status: 'pending', guests: 3 },
  { id: '3', guest: 'Lê Minh C', email: 'minhc@email.com', room: 'Standard City View', checkIn: '10/04/2026', checkOut: '12/04/2026', amount: '1.800.000đ', status: 'confirmed', guests: 1 },
  { id: '4', guest: 'Phạm Đức D', email: 'ducd@email.com', room: 'Family Deluxe', checkIn: '22/04/2026', checkOut: '24/04/2026', amount: '6.400.000đ', status: 'cancelled', guests: 4 },
  { id: '5', guest: 'Hoàng Thị E', email: 'thie@email.com', room: 'Royal Penthouse', checkIn: '25/04/2026', checkOut: '28/04/2026', amount: '45.000.000đ', status: 'pending', guests: 2 },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'confirmed': return { label: 'Xác nhận', color: AppColors.success, bg: AppColors.successLight, icon: 'checkmark-circle' as const };
    case 'pending': return { label: 'Chờ duyệt', color: AppColors.warning, bg: AppColors.warningLight, icon: 'time' as const };
    case 'cancelled': return { label: 'Đã hủy', color: AppColors.danger, bg: AppColors.dangerLight, icon: 'close-circle' as const };
    default: return { label: status, color: AppColors.textSecondary, bg: AppColors.borderLight, icon: 'ellipsis-horizontal' as const };
  }
};

export default function AdminBookingsScreen() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all'
    ? BOOKINGS
    : BOOKINGS.filter((b) => b.status === activeTab);

  return (
    <View style={styles.container}>
      {/* Tab Filter */}
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

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const statusConfig = getStatusConfig(item.status);
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.guestRow}>
                  <View style={styles.guestAvatar}>
                    <Text style={styles.guestAvatarText}>{item.guest[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guestName}>{item.guest}</Text>
                    <Text style={styles.guestEmail}>{item.email}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardBody}>
                <View style={styles.detailRow}>
                  <Ionicons name="bed-outline" size={16} color={AppColors.textSecondary} />
                  <Text style={styles.detailText}>{item.room}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color={AppColors.textSecondary} />
                  <Text style={styles.detailText}>{item.checkIn} → {item.checkOut}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="people-outline" size={16} color={AppColors.textSecondary} />
                  <Text style={styles.detailText}>{item.guests} khách</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.amount}>{item.amount}</Text>
                {item.status === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]}>
                      <Ionicons name="checkmark" size={16} color={AppColors.success} />
                      <Text style={[styles.actionBtnText, { color: AppColors.success }]}>Duyệt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]}>
                      <Ionicons name="close" size={16} color={AppColors.danger} />
                      <Text style={[styles.actionBtnText, { color: AppColors.danger }]}>Từ chối</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={AppColors.textLight} />
            <Text style={styles.emptyText}>Không có booking nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  tabList: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm },
  tab: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: Radius.round, backgroundColor: '#fff',
    borderWidth: 1, borderColor: AppColors.border, marginRight: Spacing.sm,
  },
  tabActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  tabText: { fontSize: 13, fontWeight: '500', color: AppColors.textSecondary },
  tabTextActive: { color: '#fff', fontWeight: '600' },

  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.huge },
  card: { backgroundColor: '#fff', borderRadius: Radius.md, marginBottom: Spacing.md, ...Shadows.small },
  cardHeader: { padding: Spacing.lg },
  guestRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  guestAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: AppColors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  guestAvatarText: { fontSize: 16, fontWeight: '700', color: AppColors.primary },
  guestName: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary },
  guestEmail: { fontSize: 12, color: AppColors.textSecondary },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardDivider: { height: 1, backgroundColor: AppColors.borderLight, marginHorizontal: Spacing.lg },
  cardBody: { padding: Spacing.lg, gap: Spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  detailText: { fontSize: 13, color: AppColors.textSecondary },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.lg, paddingTop: 0,
  },
  amount: { fontSize: 18, fontWeight: 'bold', color: AppColors.accent },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.sm,
  },
  approveBtn: { backgroundColor: AppColors.successLight },
  rejectBtn: { backgroundColor: AppColors.dangerLight },
  actionBtnText: { fontSize: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyText: { fontSize: 16, color: AppColors.textSecondary, marginTop: Spacing.md },
});
