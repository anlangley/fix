import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, StyleSheet, Dimensions, KeyboardAvoidingView,
  Platform, ScrollView, ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiClient } from '../../services/api';
import { router, useLocalSearchParams } from 'expo-router';
import { AppColors, Gradients, Shadows, Radius, Spacing } from '../../constants/theme';

const { width } = Dimensions.get('window');

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Vui lòng nhập mã xác thực'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: '', password: '', confirmPassword: '' }
  });

    const onSubmit = async (data: ResetPasswordForm) => {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token: data.token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (response.data.success) {
        Alert.alert(
          "Thành công",
          "Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập lại.",
          [{ text: "Đăng nhập ngay", onPress: () => router.replace('/(auth)/login') }]
        );
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Mã xác thực không hợp lệ hoặc đã hết hạn.";
      Alert.alert("Lỗi", message);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/nn1.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(27, 31, 59, 0.3)', 'rgba(27, 31, 59, 0.7)', 'rgba(27, 31, 59, 0.95)']}
          style={styles.gradient}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.brandContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="lock-open-outline" size={36} color={AppColors.accent} />
                </View>
                <Text style={styles.brandName}>Đặt Lại Mật Khẩu</Text>
                {email && <Text style={styles.brandSlogan}>Mã đã được gửi đến: {email}</Text>}
              </View>

              <View style={styles.formCard}>
                {/* Token Input */}
                <Controller
                  control={control}
                  name="token"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputWrapper}>
                      <View style={[styles.inputContainer, errors.token && styles.inputError]}>
                        <Ionicons name="key-outline" size={20} color={AppColors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          placeholder="Mã xác thực (Token)"
                          placeholderTextColor={AppColors.textLight}
                          style={styles.input}
                          value={value}
                          onChangeText={onChange}
                        />
                      </View>
                      {errors.token && <Text style={styles.errorText}>{errors.token.message}</Text>}
                    </View>
                  )}
                />

                {/* Password Input */}
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputWrapper}>
                      <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                        <Ionicons name="lock-closed-outline" size={20} color={AppColors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          placeholder="Mật khẩu mới"
                          placeholderTextColor={AppColors.textLight}
                          secureTextEntry={!showPassword}
                          style={styles.input}
                          value={value}
                          onChangeText={onChange}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={AppColors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                    </View>
                  )}
                />

                {/* Confirm Password Input */}
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputWrapper}>
                      <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                        <Ionicons name="lock-closed-outline" size={20} color={AppColors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          placeholder="Xác nhận mật khẩu mới"
                          placeholderTextColor={AppColors.textLight}
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
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  backButton: {
    position: 'absolute', top: 50, left: 20, zIndex: 10,
    padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scrollContent: {
    flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl, paddingVertical: 80,
  },
  brandContainer: { alignItems: 'center', marginBottom: Spacing.xxxl },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md, borderWidth: 2, borderColor: AppColors.accent,
  },
  brandName: { fontSize: 26, fontWeight: 'bold', color: AppColors.textWhite },
  brandSlogan: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: Spacing.xs, textAlign: 'center' },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: Radius.xl, padding: Spacing.xxl, ...Shadows.large,
  },
  inputWrapper: { marginBottom: Spacing.lg },
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
  submitButton: {
    height: 52, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.md,
  },
  buttonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});
