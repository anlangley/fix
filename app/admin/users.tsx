import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Shadows, Radius, Spacing } from '../../constants/theme';
import { apiClient } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AVATAR_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      if (!isRefreshing) setIsLoading(true);
      const response = await apiClient.get('/admin/users');
      if (response.data?.success) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Fetch admin users failed:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  const handleToggleRole = async (userToUpdate: any) => {
    // Không cho phép tự đổi quyền của mình
    if (userToUpdate.id === user?.id) {
       Alert.alert('Thông báo', 'Bạn không thể tự thay đổi quyền của chính mình.');
       return;
    }

    const newRole = userToUpdate.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const roleLabel = newRole === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'NGƯỜI DÙNG';

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn đổi quyền của ${userToUpdate.name} thành ${roleLabel}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đồng ý', 
          onPress: async () => {
            try {
              const response = await apiClient.patch(`/admin/users/${userToUpdate.id}/role`, { role: newRole });
              if (response.data?.success) {
                // Cập nhật state local
                setUsers(prev => prev.map(u => u.id === userToUpdate.id ? { ...u, role: newRole } : u));
                Alert.alert('Thành công', 'Đã cập nhật quyền hạn thành công.');
              }
            } catch (error: any) {
              console.error('Update role failed:', error);
              Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật quyền.');
            }
          }
        }
      ]
    );
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.isEmailVerified).length,
    admins: users.filter(u => u.role === 'ADMIN').length,
  };

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Ionicons name="people" size={20} color={AppColors.info} />
          <Text style={styles.summaryValue}>{stats.total}</Text>
          <Text style={styles.summaryLabel}>Tổng users</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="checkmark-circle" size={20} color={AppColors.success} />
          <Text style={styles.summaryValue}>{stats.active}</Text>
          <Text style={styles.summaryLabel}>Đang hoạt động</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="shield" size={20} color={AppColors.warning} />
          <Text style={styles.summaryValue}>{stats.admins}</Text>
          <Text style={styles.summaryLabel}>Admin</Text>
        </View>
      </View>

      {isLoading && !isRefreshing ? (
         <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={AppColors.primary} />
         </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[AppColors.primary]} />
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              style={styles.userCard} 
              activeOpacity={0.9}
              onLongPress={() => handleToggleRole(item)}
            >
              <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] + '20' }]}>
                <Text style={[styles.avatarText, { color: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                  {item.name[0]}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <View style={[
                    styles.roleBadge,
                    { backgroundColor: item.role === 'ADMIN' ? AppColors.warningLight : AppColors.infoLight }
                  ]}>
                    <Text style={[
                      styles.roleText,
                      { color: item.role === 'ADMIN' ? AppColors.warning : AppColors.info }
                    ]}>
                      {item.role}
                    </Text>
                  </View>
                </View>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.userMeta}>
                  <Text style={styles.userMetaText}>📅 {new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                  <Text style={styles.userMetaText}>🏨 {item._count?.bookings || 0} booking</Text>
                  <View style={[styles.activeDot, { backgroundColor: item.isEmailVerified ? AppColors.success : AppColors.textLight }]} />
                </View>
              </View>
              <TouchableOpacity onPress={() => handleToggleRole(item)}>
                <Ionicons name="settings-outline" size={20} color={AppColors.textLight} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
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
    flex: 1, backgroundColor: '#fff', borderRadius: Radius.md,
    padding: Spacing.md, alignItems: 'center', ...Shadows.small, gap: 4,
  },
  summaryValue: { fontSize: 22, fontWeight: 'bold', color: AppColors.textPrimary },
  summaryLabel: { fontSize: 11, color: AppColors.textSecondary },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.huge },
  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: Radius.md,
    padding: Spacing.lg, marginBottom: Spacing.sm,
    gap: Spacing.md, ...Shadows.small,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userNameRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  userName: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: Radius.xs },
  roleText: { fontSize: 10, fontWeight: '700' },
  userEmail: { fontSize: 13, color: AppColors.textSecondary, marginTop: 1 },
  userMeta: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: 4,
  },
  userMetaText: { fontSize: 11, color: AppColors.textLight },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
});
