import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../constants/theme';
import { apiClient } from '../../services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'SYSTEM' | 'PROMOTION' | 'INFO';
  isRead: boolean;
  createdAt: string;
}

export default function NotificationCenter() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      if (response.data?.success) {
        setNotifications(response.data.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      if (response.data?.success) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiClient.patch('/notifications/read-all');
      if (response.data?.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotif = async (id: string) => {
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      if (response.data?.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING': return 'calendar';
      case 'PROMOTION': return 'gift';
      case 'SYSTEM': return 'settings-outline';
      default: return 'notifications-outline';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'BOOKING': return AppColors.primary;
      case 'PROMOTION': return AppColors.danger;
      case 'SYSTEM': return AppColors.accent;
      default: return AppColors.textSecondary;
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notifCard, !item.isRead && styles.unreadCard]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: getColor(item.type) + '15' }]}>
        <Ionicons name={getIcon(item.type) as any} size={22} color={getColor(item.type)} />
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteNotif(item.id)}>
        <Ionicons name="trash-outline" size={18} color={AppColors.textLight} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hộp thư thông báo</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/profile/notifications')}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {notifications.length > 0 && (
        <View style={styles.actionsBar}>
          <Text style={styles.countText}>{notifications.filter(n => !n.isRead).length} thông báo chưa đọc</Text>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Đánh dấu tất cả là đã đọc</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={AppColors.accent} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={64} color={AppColors.textLight} />
              <Text style={styles.emptyText}>Hiện tại bạn chưa có thông báo nào</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  header: {
    paddingTop: 50, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  settingsBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.lg },
  actionsBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: AppColors.borderLight,
  },
  countText: { fontSize: 13, color: AppColors.textSecondary },
  markAllText: { fontSize: 13, color: AppColors.primary, fontWeight: '600' },
  notifCard: {
    flexDirection: 'row', padding: Spacing.lg, backgroundColor: '#fff',
    borderRadius: Radius.md, marginBottom: Spacing.md, ...Shadows.small,
  },
  unreadCard: { backgroundColor: AppColors.primary + '05', borderWidth: 1, borderColor: AppColors.primary + '20' },
  iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  content: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 15, color: AppColors.textPrimary, fontWeight: '500' },
  unreadTitle: { fontWeight: 'bold' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: AppColors.primary },
  message: { fontSize: 14, color: AppColors.textSecondary, lineHeight: 20 },
  time: { fontSize: 12, color: AppColors.textLight, marginTop: 8 },
  deleteBtn: { padding: 4, marginLeft: Spacing.sm, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: AppColors.textLight, marginTop: Spacing.lg },
});
