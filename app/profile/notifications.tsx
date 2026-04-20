import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../constants/theme';

export default function NotificationsScreen() {
  const router = useRouter();

  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  const SETTINGS = [
    {
      title: 'Thông báo đặt phòng',
      items: [
        { label: 'Cập nhật trạng thái đơn', desc: 'Thông báo khi đơn được duyệt, hủy hoặc hoàn thành', value: bookingUpdates, onToggle: setBookingUpdates },
        { label: 'Nhắc nhở check-in', desc: 'Nhắc trước 1 ngày check-in', value: true, onToggle: () => {} },
      ],
    },
    {
      title: 'Khuyến mãi & Giá',
      items: [
        { label: 'Ưu đãi & Khuyến mãi', desc: 'Nhận thông tin về giảm giá và combo hấp dẫn', value: promotions, onToggle: setPromotions },
        { label: 'Cảnh báo giá', desc: 'Thông báo khi phòng yêu thích giảm giá', value: priceAlerts, onToggle: setPriceAlerts },
      ],
    },
    {
      title: 'Kênh thông báo',
      items: [
        { label: 'Push Notification', desc: 'Thông báo trên thiết bị', value: pushNotifs, onToggle: setPushNotifs },
        { label: 'Email', desc: 'Nhận thông báo qua email', value: emailNotifs, onToggle: setEmailNotifs },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {SETTINGS.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, iIdx) => (
                <View key={iIdx} style={[styles.settingItem, iIdx < section.items.length - 1 && styles.settingDivider]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    <Text style={styles.settingDesc}>{item.desc}</Text>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: AppColors.border, true: AppColors.accent + '80' }}
                    thumbColor={item.value ? AppColors.accent : '#f4f3f4'}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
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
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: AppColors.textSecondary, marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCard: { backgroundColor: '#fff', borderRadius: Radius.md, ...Shadows.small },
  settingItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.lg,
  },
  settingDivider: { borderBottomWidth: 1, borderBottomColor: AppColors.borderLight },
  settingLabel: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary },
  settingDesc: { fontSize: 12, color: AppColors.textSecondary, marginTop: 2 },
});
