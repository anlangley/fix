import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../constants/theme';

const FAQ_DATA = [
  {
    q: 'Làm thế nào để đặt phòng?',
    a: 'Chọn phòng yêu thích từ trang chủ → Nhấn "Đặt phòng" → Chọn ngày check-in/check-out → Tiến hành thanh toán qua VietQR → Chờ Admin xác nhận.',
  },
  {
    q: 'Tôi có thể hủy đặt phòng không?',
    a: 'Bạn có thể hủy đặt phòng khi đơn đang ở trạng thái "Chờ thanh toán" hoặc "Chờ xác nhận". Sau khi Admin duyệt, vui lòng liên hệ hotline để hỗ trợ hủy.',
  },
  {
    q: 'Thanh toán bằng cách nào?',
    a: 'Hiện tại LuxStay hỗ trợ thanh toán qua VietQR (chuyển khoản MB Bank). Quét mã QR bằng ứng dụng ngân hàng và xác nhận đã chuyển khoản trên ứng dụng.',
  },
  {
    q: 'Khi nào đặt phòng được xác nhận?',
    a: 'Sau khi bạn xác nhận đã chuyển khoản, Admin sẽ kiểm tra tài khoản ngân hàng và duyệt đơn. Thông thường trong vòng 15 - 30 phút trong giờ hành chính.',
  },
  {
    q: 'Làm sao để liên hệ hỗ trợ?',
    a: 'Bạn có thể gọi hotline 1900-LUXSTAY hoặc gửi email tới support@luxstay.vn. Đội ngũ hỗ trợ hoạt động 24/7.',
  },
  {
    q: 'Tôi quên mật khẩu thì sao?',
    a: 'Tại màn hình đăng nhập, nhấn "Quên mật khẩu" → Nhập email → Kiểm tra mã OTP trong hộp thư → Đặt mật khẩu mới.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trung tâm hỗ trợ</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Cards */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('tel:1900123456')}>
            <View style={[styles.contactIcon, { backgroundColor: AppColors.successLight }]}>
              <Ionicons name="call" size={22} color={AppColors.success} />
            </View>
            <Text style={styles.contactLabel}>Gọi Hotline</Text>
            <Text style={styles.contactValue}>1900-LUXSTAY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('mailto:support@luxstay.vn')}>
            <View style={[styles.contactIcon, { backgroundColor: AppColors.infoLight }]}>
              <Ionicons name="mail" size={22} color={AppColors.info} />
            </View>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>support@luxstay.vn</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
        <View style={styles.faqCard}>
          {FAQ_DATA.map((faq, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.faqItem, idx < FAQ_DATA.length - 1 && styles.faqDivider]}
              onPress={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Ionicons
                  name={expandedIdx === idx ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={AppColors.textSecondary}
                />
              </View>
              {expandedIdx === idx && (
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          ))}
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
  contactRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  contactCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: Radius.md,
    padding: Spacing.lg, alignItems: 'center', ...Shadows.small,
  },
  contactIcon: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm,
  },
  contactLabel: { fontSize: 14, fontWeight: '600', color: AppColors.textPrimary },
  contactValue: { fontSize: 11, color: AppColors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: AppColors.textSecondary, marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  faqCard: { backgroundColor: '#fff', borderRadius: Radius.md, ...Shadows.small, marginBottom: Spacing.huge },
  faqItem: { padding: Spacing.lg },
  faqDivider: { borderBottomWidth: 1, borderBottomColor: AppColors.borderLight },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600', color: AppColors.textPrimary },
  faqAnswer: { fontSize: 13, color: AppColors.textSecondary, marginTop: Spacing.sm, lineHeight: 20 },
});
