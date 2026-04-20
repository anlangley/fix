import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../constants/theme';

const PAYMENT_INFO = [
  {
    id: 'vietqr',
    name: 'VietQR (MB Bank)',
    desc: 'Chuyển khoản ngân hàng thông qua mã QR chuẩn VietQR',
    icon: 'qr-code-outline' as const,
    color: '#005BAA',
    isActive: true,
  },
  {
    id: 'momo',
    name: 'Ví MoMo',
    desc: 'Đang trong lộ trình phát triển',
    icon: 'wallet-outline' as const,
    color: '#A50064',
    isActive: false,
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    desc: 'Đang trong lộ trình phát triển',
    icon: 'card-outline' as const,
    color: '#005BAA',
    isActive: false,
  },
];

export default function PaymentMethodsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Phương thức được hỗ trợ</Text>

        {PAYMENT_INFO.map((method) => (
          <View key={method.id} style={[styles.card, !method.isActive && styles.cardDisabled]}>
            <View style={[styles.iconBox, { backgroundColor: method.color + '15' }]}>
              <Ionicons name={method.icon} size={24} color={method.color} />
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{method.name}</Text>
                {method.isActive ? (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Đang sử dụng</Text>
                  </View>
                ) : (
                  <View style={styles.inactiveBadge}>
                    <Text style={styles.inactiveBadgeText}>Sắp ra mắt</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardDesc}>{method.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color={AppColors.success} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Thanh toán an toàn</Text>
            <Text style={styles.infoDesc}>
              Mọi giao dịch thanh toán đều được mã hóa và bảo vệ. Thông tin tài khoản của bạn không được lưu trữ trên hệ thống.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.lg,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { padding: Spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: AppColors.textPrimary, marginBottom: Spacing.lg },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: '#fff', borderRadius: Radius.md,
    padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.small,
  },
  cardDisabled: { opacity: 0.5 },
  iconBox: {
    width: 48, height: 48, borderRadius: Radius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary },
  cardDesc: { fontSize: 12, color: AppColors.textSecondary, marginTop: 2 },
  activeBadge: {
    backgroundColor: AppColors.successLight, paddingHorizontal: Spacing.sm,
    paddingVertical: 2, borderRadius: Radius.sm,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '600', color: AppColors.success },
  inactiveBadge: {
    backgroundColor: AppColors.borderLight, paddingHorizontal: Spacing.sm,
    paddingVertical: 2, borderRadius: Radius.sm,
  },
  inactiveBadgeText: { fontSize: 11, fontWeight: '600', color: AppColors.textLight },
  infoCard: {
    flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start',
    backgroundColor: AppColors.successLight, borderRadius: Radius.md,
    padding: Spacing.lg, marginTop: Spacing.xl,
  },
  infoTitle: { fontSize: 14, fontWeight: '600', color: AppColors.success },
  infoDesc: { fontSize: 12, color: AppColors.textSecondary, marginTop: 4, lineHeight: 18 },
});
