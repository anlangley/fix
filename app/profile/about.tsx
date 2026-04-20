import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../constants/theme';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Về chúng tôi</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo & Name */}
        <View style={styles.logoSection}>
          <LinearGradient
            colors={['#D4A853', '#B8892F']}
            style={styles.logoCircle}
          >
            <Ionicons name="diamond" size={40} color="#fff" />
          </LinearGradient>
          <Text style={styles.appName}>LuxStay Hotel</Text>
          <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
        </View>

        {/* Description */}
        <View style={styles.descCard}>
          <Text style={styles.descText}>
            LuxStay là ứng dụng đặt phòng khách sạn cao cấp, mang đến trải nghiệm 
            lưu trú sang trọng và tiện nghi nhất cho khách hàng. Với giao diện hiện đại 
            và quy trình đặt phòng nhanh chóng, LuxStay cam kết đồng hành cùng bạn 
            trong mọi chuyến đi.
          </Text>
        </View>

        {/* Features */}
        <Text style={styles.sectionTitle}>Tính năng nổi bật</Text>
        <View style={styles.featuresCard}>
          {[
            { icon: 'search-outline' as const, title: 'Tìm kiếm thông minh', desc: 'Dễ dàng tìm phòng phù hợp' },
            { icon: 'shield-checkmark-outline' as const, title: 'Thanh toán an toàn', desc: 'VietQR mã hóa bảo mật' },
            { icon: 'time-outline' as const, title: 'Đặt phòng nhanh', desc: 'Chỉ vài bước đơn giản' },
            { icon: 'star-outline' as const, title: 'Đánh giá thực', desc: 'Từ khách hàng thực tế' },
          ].map((feat, idx) => (
            <View key={idx} style={[styles.featureItem, idx < 3 && styles.featureDivider]}>
              <View style={styles.featureIcon}>
                <Ionicons name={feat.icon} size={22} color={AppColors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Team */}
        <Text style={styles.sectionTitle}>Đội ngũ phát triển</Text>
        <View style={styles.teamCard}>
          <Ionicons name="people" size={28} color={AppColors.primary} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.teamTitle}>LuxStay Development Team</Text>
            <Text style={styles.teamDesc}>Dự án Ứng dụng Đặt phòng Khách sạn</Text>
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.linksCard}>
          {[
            { label: 'Điều khoản sử dụng', icon: 'document-text-outline' as const },
            { label: 'Chính sách bảo mật', icon: 'lock-closed-outline' as const },
            { label: 'Giấy phép phần mềm', icon: 'reader-outline' as const },
          ].map((link, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.linkItem, idx < 2 && styles.linkDivider]}
              activeOpacity={0.7}
            >
              <Ionicons name={link.icon} size={20} color={AppColors.textSecondary} />
              <Text style={styles.linkLabel}>{link.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={AppColors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.copyright}>© 2026 LuxStay Hotel. All rights reserved.</Text>
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
  logoSection: { alignItems: 'center', marginVertical: Spacing.xl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.medium,
  },
  appName: { fontSize: 24, fontWeight: 'bold', color: AppColors.textPrimary, marginTop: Spacing.md },
  appVersion: { fontSize: 14, color: AppColors.textSecondary, marginTop: 4 },
  descCard: {
    backgroundColor: '#fff', borderRadius: Radius.md,
    padding: Spacing.xl, ...Shadows.small,
  },
  descText: { fontSize: 14, color: AppColors.textSecondary, lineHeight: 22, textAlign: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: AppColors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  featuresCard: { backgroundColor: '#fff', borderRadius: Radius.md, ...Shadows.small },
  featureItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.lg,
  },
  featureDivider: { borderBottomWidth: 1, borderBottomColor: AppColors.borderLight },
  featureIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: AppColors.accent + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  featureTitle: { fontSize: 14, fontWeight: '600', color: AppColors.textPrimary },
  featureDesc: { fontSize: 12, color: AppColors.textSecondary, marginTop: 2 },
  teamCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: Radius.md,
    padding: Spacing.xl, ...Shadows.small,
  },
  teamTitle: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary },
  teamDesc: { fontSize: 12, color: AppColors.textSecondary, marginTop: 2 },
  linksCard: { backgroundColor: '#fff', borderRadius: Radius.md, ...Shadows.small, marginTop: Spacing.xl },
  linkItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.lg,
  },
  linkDivider: { borderBottomWidth: 1, borderBottomColor: AppColors.borderLight },
  linkLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: AppColors.textPrimary },
  copyright: {
    textAlign: 'center', color: AppColors.textLight,
    fontSize: 12, marginVertical: Spacing.xxl,
  },
});
