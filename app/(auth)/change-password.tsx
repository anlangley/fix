import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, StyleSheet, Dimensions, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiClient } from '../../services/api';
import { router } from 'expo-router';
import { AppColors, Gradients, Shadows, Radius, Spacing } from '../../constants/theme';

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string()
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordScreen() {
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' }
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      const response = await apiClient.post('/auth/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (response.data.success) {
        Alert.alert(
          "Thành công",
          "Mật khẩu của bạn đã được thay đổi thành công.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        reset();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Mật khẩu hiện tại không chính xác.";
      Alert.alert("Lỗi", message);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi Mật Khẩu</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={48} color={AppColors.accent} style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Bảo mật tài khoản</Text>
            <Text style={styles.infoDesc}>
              Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để cập nhật bảo mật cho tài khoản của bạn.
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Old Password */}
            <Controller
              control={control}
              name="oldPassword"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Mật khẩu hiện tại</Text>
                  <View style={[styles.inputContainer, errors.oldPassword && styles.inputError]}>
                    <Ionicons name="lock-closed-outline" size={20} color={AppColors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Nhập mật khẩu cũ"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={AppColors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  {errors.oldPassword && <Text style={styles.errorText}>{errors.oldPassword.message}</Text>}
                </View>
              )}
            />

            {/* New Password */}
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Mật khẩu mới</Text>
                  <View style={[styles.inputContainer, errors.newPassword && styles.inputError]}>
                    <Ionicons name="key-outline" size={20} color={AppColors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Ít nhất 8 ký tự, có chữ hoa, thường & số"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                  {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword.message}</Text>}
                </View>
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                  <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={AppColors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Nhập lại mật khẩu mới"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
                </View>
              )}
            />

            <TouchableOpacity
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.8}
              style={styles.submitBtnContainer}
            >
              <LinearGradient
                colors={Gradients.button as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>CẬP NHẬT MẬT KHẨU</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  header: {
    paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: Spacing.xl },
  infoCard: {
    backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.xl,
    alignItems: 'center', marginBottom: Spacing.xl, ...Shadows.small,
  },
  infoIcon: { marginBottom: Spacing.md },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: AppColors.textPrimary, marginBottom: 8 },
  infoDesc: { fontSize: 13, color: AppColors.textSecondary, textAlign: 'center', lineHeight: 18 },
  formContainer: {
    backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.xl, ...Shadows.small,
  },
  inputWrapper: { marginBottom: Spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: AppColors.textPrimary, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppColors.background,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: AppColors.border,
    paddingHorizontal: Spacing.lg, height: 52,
  },
  inputIcon: { marginRight: Spacing.md },
  input: { flex: 1, fontSize: 15, color: AppColors.textPrimary },
  inputError: { borderColor: AppColors.danger, backgroundColor: AppColors.dangerLight },
  errorText: { color: AppColors.danger, fontSize: 12, marginTop: 4, marginLeft: 4 },
  submitBtnContainer: { marginTop: Spacing.md },
  submitButton: {
    height: 52, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});
