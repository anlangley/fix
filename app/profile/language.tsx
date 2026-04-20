import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../constants/theme';

const LANGUAGES = [
  { id: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'ja', name: '日本語', flag: '🇯🇵' },
  { id: 'ko', name: '한국어', flag: '🇰🇷' },
  { id: 'zh', name: '中文', flag: '🇨🇳' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('vi');

  const handleSelect = (id: string) => {
    setSelected(id);
    if (id !== 'vi') {
      Alert.alert('Thông báo', 'Hiện tại ứng dụng chỉ hỗ trợ Tiếng Việt. Các ngôn ngữ khác sẽ được bổ sung trong phiên bản tiếp theo.');
      setSelected('vi');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ngôn ngữ</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Chọn ngôn ngữ hiển thị</Text>
        <View style={styles.listCard}>
          {LANGUAGES.map((lang, idx) => (
            <TouchableOpacity
              key={lang.id}
              style={[styles.langItem, idx < LANGUAGES.length - 1 && styles.langDivider]}
              onPress={() => handleSelect(lang.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.langFlag}>{lang.flag}</Text>
              <Text style={styles.langName}>{lang.name}</Text>
              {selected === lang.id ? (
                <Ionicons name="checkmark-circle" size={22} color={AppColors.accent} />
              ) : (
                <View style={styles.radioEmpty} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
  sectionTitle: { fontSize: 14, fontWeight: '700', color: AppColors.textSecondary, marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  listCard: { backgroundColor: '#fff', borderRadius: Radius.md, ...Shadows.small },
  langItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.lg,
  },
  langDivider: { borderBottomWidth: 1, borderBottomColor: AppColors.borderLight },
  langFlag: { fontSize: 24 },
  langName: { flex: 1, fontSize: 15, fontWeight: '500', color: AppColors.textPrimary },
  radioEmpty: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: AppColors.border,
  },
});
