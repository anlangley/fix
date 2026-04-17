import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing } from '../../constants/theme';
import { apiClient } from '../../services/api';

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'AVAILABLE': return { label: 'Trống', color: AppColors.success, bg: AppColors.successLight };
    case 'BOOKED': return { label: 'Có khách', color: AppColors.info, bg: AppColors.infoLight };
    case 'MAINTENANCE': return { label: 'Bảo trì', color: AppColors.warning, bg: AppColors.warningLight };
    default: return { label: status, color: AppColors.textSecondary, bg: AppColors.borderLight };
  }
};

export default function AdminRoomsScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      if (!isRefreshing) setIsLoading(true);
      const response = await apiClient.get('/rooms?limit=100'); // Fetch all for admin
      if (response.data?.success) {
        setRooms(response.data.data.rooms);
      }
    } catch (error) {
      console.error('Fetch admin rooms failed:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchRooms();
  };

  const handleEdit = (roomId: string) => {
    router.push({
      pathname: '/admin/add-room',
      params: { id: roomId }
    });
  };

  const handleDelete = (roomId: string, roomName: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa phòng "${roomName}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await apiClient.delete(`/rooms/${roomId}`);
              if (res.data?.success) {
                Alert.alert('Thành công', 'Đã xóa phòng.');
                fetchRooms(); // Load lại
              }
            } catch (error: any) {
              console.error('Delete room failed:', error);
              Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xóa phòng này (có thể do đang có booking).');
            }
          }
        }
      ]
    );
  };

  const stats = {
    available: rooms.filter(r => r.status === 'AVAILABLE').length,
    booked: rooms.filter(r => r.status === 'BOOKED').length,
    maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý phòng</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: AppColors.success }]}>
          <Text style={styles.summaryValue}>{stats.available}</Text>
          <Text style={styles.summaryLabel}>Trống</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: AppColors.info }]}>
          <Text style={styles.summaryValue}>{stats.booked}</Text>
          <Text style={styles.summaryLabel}>Có khách</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: AppColors.warning }]}>
          <Text style={styles.summaryValue}>{stats.maintenance}</Text>
          <Text style={styles.summaryLabel}>Bảo trì</Text>
        </View>
      </View>

      {isLoading && !isRefreshing ? (
         <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={AppColors.primary} />
         </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[AppColors.primary]} />
          }
          renderItem={({ item }) => {
            const statusConfig = getStatusConfig(item.status);
            const imageUrl = item.images?.[0]?.url;
            
            return (
              <TouchableOpacity style={styles.roomCard} activeOpacity={0.9}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.roomImage} />
                ) : (
                  <View style={[styles.roomImage, { backgroundColor: AppColors.borderLight, justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="image-outline" size={30} color={AppColors.textLight} />
                  </View>
                )}
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
                    <Text style={styles.roomPrice}>{Number(item.pricePerNight).toLocaleString('vi-VN')}đ/đêm</Text>
                    <Text style={styles.roomBookings}>{item.reviewCount || 0} đánh giá</Text>
                  </View>
                  
                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: AppColors.primary + '15' }]}
                      onPress={() => handleEdit(item.id)}
                    >
                      <Ionicons name="pencil-outline" size={16} color={AppColors.primary} />
                      <Text style={[styles.actionText, { color: AppColors.primary }]}>Sửa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: AppColors.danger + '15' }]}
                      onPress={() => handleDelete(item.id, item.name)}
                    >
                      <Ionicons name="trash-outline" size={16} color={AppColors.danger} />
                      <Text style={[styles.actionText, { color: AppColors.danger }]}>Xóa</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => router.push('/admin/add-room')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  header: {
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: Spacing.lg,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: AppColors.borderLight,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: AppColors.textPrimary },
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
  actionRow: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginTop: Spacing.sm, borderTopWidth: 1, borderTopColor: AppColors.borderLight, paddingTop: Spacing.sm,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.sm, gap: 4 },
  actionText: { fontSize: 12, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: AppColors.accent, justifyContent: 'center',
    alignItems: 'center', ...Shadows.large,
  },
});
