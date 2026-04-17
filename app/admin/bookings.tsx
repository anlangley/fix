import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Shadows, Radius, Spacing } from '../../constants/theme';
import { apiClient } from '../../services/api';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'CONFIRMED', label: 'Xác nhận' },
  { id: 'PENDING', label: 'Chờ duyệt' },
  { id: 'CANCELLED', label: 'Đã hủy' },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'CONFIRMED': return { label: 'Xác nhận', color: AppColors.success, bg: AppColors.successLight, icon: 'checkmark-circle' as const };
    case 'PENDING': return { label: 'Chờ duyệt', color: AppColors.warning, bg: AppColors.warningLight, icon: 'time' as const };
    case 'CANCELLED': return { label: 'Đã hủy', color: AppColors.danger, bg: AppColors.dangerLight, icon: 'close-circle' as const };
    default: return { label: status, color: AppColors.textSecondary, bg: AppColors.borderLight, icon: 'ellipsis-horizontal' as const };
  }
};

export default function AdminBookingsScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      if (!isRefreshing) setIsLoading(true);
      const statusFilter = activeTab === 'all' ? '' : `&status=${activeTab}`;
      const response = await apiClient.get(`/bookings?limit=50${statusFilter}`);
      if (response.data?.success) {
        setBookings(response.data.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching admin bookings:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đặt phòng.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setActionLoading(id);
      const response = await apiClient.put(`/bookings/${id}/status`, { status: newStatus });
      if (response.data?.success) {
        // Cập nhật state local
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        Alert.alert('Thành công', `Đã cập nhật trạng thái booking thành ${newStatus === 'CONFIRMED' ? 'Đã xác nhận' : 'Đã hủy'}.`);
      }
    } catch (error: any) {
      console.error('Update status failed:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = bookings; // Filter đã được Backend xử lý thông qua API query

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchBookings();
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Filter */}
      <View>
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

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[AppColors.primary]} />
        }
        renderItem={({ item }) => {
          const statusConfig = getStatusConfig(item.status);
          const isProcessing = actionLoading === item.id;

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.guestRow}>
                  <View style={styles.guestAvatar}>
                    <Text style={styles.guestAvatarText}>{item.user?.name?.[0] || 'U'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guestName}>{item.user?.name}</Text>
                    <Text style={styles.guestEmail}>{item.user?.email}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                      <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
                      <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: item.paymentStatus === 'PAID' ? AppColors.successLight : AppColors.dangerLight }
                    ]}>
                      <Ionicons 
                        name={item.paymentStatus === 'PAID' ? 'card' : 'card-outline'} 
                        size={12} 
                        color={item.paymentStatus === 'PAID' ? AppColors.success : AppColors.danger} 
                      />
                      <Text style={[
                        styles.statusText, 
                        { color: item.paymentStatus === 'PAID' ? AppColors.success : AppColors.danger }
                      ]}>
                        {item.paymentStatus === 'PAID' ? 'Đã trả' : 'Chưa trả'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardBody}>
                <View style={styles.detailRow}>
                  <Ionicons name="bed-outline" size={16} color={AppColors.textSecondary} />
                  <Text style={styles.detailText}>{item.room?.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="card-outline" size={16} color={AppColors.textSecondary} />
                  <Text style={styles.detailText}>
                    Phương thức: <Text style={{fontWeight: '700', color: AppColors.primary}}>{item.paymentMethod || 'N/A'}</Text>
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color={AppColors.textSecondary} />
                  <Text style={styles.detailText}>
                    {new Date(item.checkInDate).toLocaleDateString('vi-VN')} → {new Date(item.checkOutDate).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="people-outline" size={16} color={AppColors.textSecondary} />
                  <Text style={styles.detailText}>{item.guestsCount} khách</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.amount}>{Number(item.totalPrice).toLocaleString('vi-VN')}đ</Text>
                {item.status === 'PENDING' && (
                  <View style={styles.actionRow}>
                    {isProcessing ? (
                      <ActivityIndicator size="small" color={AppColors.primary} />
                    ) : (
                      <>
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.approveBtn]}
                          onPress={() => handleUpdateStatus(item.id, 'CONFIRMED')}
                        >
                          <Ionicons name="checkmark" size={16} color={AppColors.success} />
                          <Text style={[styles.actionBtnText, { color: AppColors.success }]}>Duyệt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.rejectBtn]}
                          onPress={() => handleUpdateStatus(item.id, 'CANCELLED')}
                        >
                          <Ionicons name="close" size={16} color={AppColors.danger} />
                          <Text style={[styles.actionBtnText, { color: AppColors.danger }]}>Từ chối</Text>
                        </TouchableOpacity>
                      </>
                    )}
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
