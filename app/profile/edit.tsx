import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../constants/theme';
import { apiClient } from '../../services/api';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data?.success) {
        const u = res.data.data.user;
        setName(u.name || '');
        setPhone(u.phone || '');
        setEmail(u.email || '');
        setAvatarUrl(u.avatarUrl || null);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    // Xin quyền truy cập thư viện ảnh
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert('Quyền truy cập', 'Cần cho phép truy cập thư viện ảnh để chọn ảnh đại diện.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];

    try {
      setIsUploadingAvatar(true);

      // Tạo FormData
      const formData = new FormData();
      const fileUri = asset.uri;
      const fileName = fileUri.split('/').pop() || 'avatar.jpg';
      const fileType = asset.mimeType || 'image/jpeg';

      formData.append('avatar', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as any);

      const res = await apiClient.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setAvatarUrl(res.data.data.avatarUrl);
        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện!');
      }
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên không được để trống');
      return;
    }
    try {
      setIsSaving(true);
      const res = await apiClient.put('/auth/profile', { name: name.trim(), phone: phone.trim() });
      if (res.data?.success) {
        const u = res.data.data.user;
        // Cập nhật AuthContext (chỉ cập nhật user data, không đổi token)
        await updateUser({ name: u.name });
        Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
        router.back();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Không thể cập nhật thông tin';
      Alert.alert('Lỗi', msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickAvatar} disabled={isUploadingAvatar} activeOpacity={0.8}>
              <View style={styles.avatarWrapper}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(name || email || 'K')[0].toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.cameraOverlay}>
                  {isUploadingAvatar ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="camera" size={18} color="#fff" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.changeAvatarText}>Nhấn để thay đổi ảnh đại diện</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Họ và tên</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={AppColors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={AppColors.textLight}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={[styles.inputContainer, styles.inputDisabled]}>
                <Ionicons name="mail-outline" size={20} color={AppColors.textLight} />
                <TextInput
                  style={[styles.input, { color: AppColors.textLight }]}
                  value={email}
                  editable={false}
                />
              </View>
              <Text style={styles.fieldHint}>Email không thể thay đổi</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Số điện thoại</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={AppColors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="VD: 0912345678"
                  placeholderTextColor={AppColors.textLight}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity onPress={handleSave} disabled={isSaving} activeOpacity={0.8}>
            <LinearGradient
              colors={Gradients.button as [string, string]}
              style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  avatarSection: { alignItems: 'center', marginVertical: Spacing.xl },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: AppColors.primary + '20',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: AppColors.accent,
  },
  avatarImage: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: AppColors.accent,
  },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: AppColors.primary },
  cameraOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: AppColors.accent,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  changeAvatarText: { fontSize: 13, color: AppColors.textSecondary, marginTop: Spacing.sm },
  formSection: { gap: Spacing.lg },
  fieldGroup: { gap: Spacing.xs },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: AppColors.textPrimary, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: '#fff', borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
    borderWidth: 1, borderColor: AppColors.borderLight, ...Shadows.small,
  },
  inputDisabled: { backgroundColor: AppColors.borderLight, borderColor: AppColors.border },
  input: { flex: 1, fontSize: 15, color: AppColors.textPrimary },
  fieldHint: { fontSize: 12, color: AppColors.textLight, marginLeft: 4 },
  saveBtn: {
    marginTop: Spacing.xxl, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center',
    marginBottom: Spacing.huge,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
