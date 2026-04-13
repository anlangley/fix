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
import { router, Link } from 'expo-router';
import { AppColors, Gradients, Shadows, Radius, Spacing } from '../../constants/theme';
import { apiClient } from '../../services/api';

const { width, height } = Dimensions.get('window');

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Tên cần ít nhất 2 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên chỉ được chứa chữ cái và khoảng trắng'),
  email: z.string().min(1, 'Vui lòng nhập Email').email('Email không đúng định dạng'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Cần ít nhất 1 chữ cái viết hoa')
    .regex(/[a-z]/, 'Cần ít nhất 1 chữ cái viết thường')
    .regex(/[0-9]/, 'Cần ít nhất 1 chữ số'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      // Gọi API đăng ký
      const response = await apiClient.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        Alert.alert(
          "Đăng ký thành công! 🎉", 
          "Chúng tôi đã gửi một email xác thực. Vui lòng kiểm tra hộp thư của bạn để kích hoạt tài khoản trước khi đăng nhập.", 
          [{ text: "Đăng nhập ngay", onPress: () => router.replace('/(auth)/login') }]
        );
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";
      Alert.alert("Đăng ký thất bại", message);
    }
  };

  const renderInput = (
    name: 'name' | 'email' | 'password' | 'confirmPassword',
    placeholder: string,
    icon: keyof typeof Ionicons.glyphMap,
    options?: { secure?: boolean; showToggle?: boolean; toggleState?: boolean; onToggle?: () => void; keyboardType?: any }
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View style={styles.inputWrapper}>
          <View style={[styles.inputContainer, errors[name] && styles.inputError]}>
            <Ionicons name={icon} size={20} color={AppColors.textSecondary} style={styles.inputIcon} />
            <TextInput
              placeholder={placeholder}
              placeholderTextColor={AppColors.textLight}
              autoCapitalize={name === 'email' ? 'none' : 'sentences'}
              keyboardType={options?.keyboardType || 'default'}
              secureTextEntry={options?.secure && !options?.toggleState}
              style={styles.input}
              value={value}
              onChangeText={onChange}
            />
            {options?.showToggle && (
              <TouchableOpacity onPress={options.onToggle}>
                <Ionicons name={options.toggleState ? "eye-off-outline" : "eye-outline"} size={20} color={AppColors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          {errors[name] && <Text style={styles.errorText}>{errors[name]?.message}</Text>}
        </View>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/nn2.jpg')}
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
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Brand */}
              <View style={styles.brandContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="person-add" size={32} color={AppColors.accent} />
                </View>
                <Text style={styles.brandName}>Tạo Tài Khoản</Text>
                <Text style={styles.brandSlogan}>Tham gia LuxStay để nhận ưu đãi đặc biệt</Text>
              </View>

              {/* Form Card */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Đăng Ký</Text>
                <Text style={styles.formSubtitle}>Điền thông tin để bắt đầu</Text>

                {renderInput('name', 'Họ và Tên', 'person-outline')}
                {renderInput('email', 'Email', 'mail-outline', { keyboardType: 'email-address' })}
                {renderInput('password', 'Mật khẩu', 'lock-closed-outline', {
                  secure: true, showToggle: true, toggleState: showPassword, onToggle: () => setShowPassword(!showPassword)
                })}
                {renderInput('confirmPassword', 'Xác nhận mật khẩu', 'shield-checkmark-outline', {
                  secure: true, showToggle: true, toggleState: showConfirm, onToggle: () => setShowConfirm(!showConfirm)
                })}

                {/* Terms */}
                <Text style={styles.termsText}>
                  Bằng việc đăng ký, bạn đồng ý với{' '}
                  <Text style={styles.termsLink}>Điều khoản dịch vụ</Text>
                  {' '}và{' '}
                  <Text style={styles.termsLink}>Chính sách bảo mật</Text>
                </Text>

                {/* Register Button */}
                <TouchableOpacity
                  disabled={isSubmitting}
                  onPress={handleSubmit(onSubmit)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={Gradients.button as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.registerButton, isSubmitting && styles.buttonDisabled]}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.registerButtonText}>TẠO TÀI KHOẢN</Text>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginRow}>
                  <Text style={styles.loginText}>Đã có tài khoản? </Text>
                  <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                      <Text style={styles.loginLink}>Đăng nhập</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xxxl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: AppColors.accent,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.textWhite,
    letterSpacing: 1,
  },
  brandSlogan: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    ...Shadows.large,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: Spacing.xl,
  },
  inputWrapper: {
    marginBottom: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    paddingHorizontal: Spacing.lg,
    height: 50,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: AppColors.textPrimary,
  },
  inputError: {
    borderColor: AppColors.danger,
    backgroundColor: AppColors.dangerLight,
  },
  errorText: {
    color: AppColors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  termsText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  termsLink: {
    color: AppColors.accent,
    fontWeight: '600',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: Radius.md,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  loginText: {
    color: AppColors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: AppColors.accent,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
