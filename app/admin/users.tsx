import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Shadows, Radius, Spacing } from '../../constants/theme';

const USERS = [
  { id: '1', name: 'Nguyễn Văn A', email: 'vana@email.com', role: 'USER', bookings: 5, joinDate: '05/01/2026', active: true },
  { id: '2', name: 'Trần Thị B', email: 'thib@email.com', role: 'USER', bookings: 12, joinDate: '10/12/2025', active: true },
  { id: '3', name: 'Lê Minh C', email: 'minhc@email.com', role: 'ADMIN', bookings: 0, joinDate: '01/06/2025', active: true },
  { id: '4', name: 'Phạm Đức D', email: 'ducd@email.com', role: 'USER', bookings: 3, joinDate: '15/02/2026', active: false },
  { id: '5', name: 'Hoàng Thị E', email: 'thie@email.com', role: 'USER', bookings: 8, joinDate: '20/11/2025', active: true },
  { id: '6', name: 'Vũ Quang F', email: 'quangf@email.com', role: 'USER', bookings: 1, joinDate: '01/04/2026', active: true },
];

const AVATAR_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];

export default function AdminUsersScreen() {
  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Ionicons name="people" size={20} color={AppColors.info} />
          <Text style={styles.summaryValue}>{USERS.length}</Text>
          <Text style={styles.summaryLabel}>Tổng users</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="checkmark-circle" size={20} color={AppColors.success} />
          <Text style={styles.summaryValue}>{USERS.filter(u => u.active).length}</Text>
          <Text style={styles.summaryLabel}>Đang hoạt động</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="shield" size={20} color={AppColors.warning} />
          <Text style={styles.summaryValue}>{USERS.filter(u => u.role === 'ADMIN').length}</Text>
          <Text style={styles.summaryLabel}>Admin</Text>
        </View>
      </View>

      <FlatList
        data={USERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.userCard} activeOpacity={0.9}>
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
                <Text style={styles.userMetaText}>📅 {item.joinDate}</Text>
                <Text style={styles.userMetaText}>🏨 {item.bookings} booking</Text>
                <View style={[styles.activeDot, { backgroundColor: item.active ? AppColors.success : AppColors.textLight }]} />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={AppColors.textLight} />
          </TouchableOpacity>
        )}
      />
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
