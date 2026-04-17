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
import { useAuth, UserData } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api';
import { router, Link } from 'expo-router';
import { AppColors, Gradients, Shadows, Radius, Spacing } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập Email').email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải lớn hơn 6 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      // Gọi API đăng nhập thực tế
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const resultData = response.data;

      if (resultData.success) {
        // Lưu trữ Token và User vào Context
        await login(resultData.data.token, {
          id: resultData.data.user.id,
          email: resultData.data.user.email,
          role: resultData.data.user.role,
          name: resultData.data.user.name,
        });

        // Điều hướng dựa trên role
        if (resultData.data.user.role === 'ADMIN') {
          router.replace('/admin');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      
      if (errorData?.code === 'EMAIL_NOT_VERIFIED') {
        Alert.alert(
          "Tài khoản chưa kích hoạt", 
          "Vui lòng kiểm tra hộp thư email của bạn để xác thực tài khoản.",
          [
            { text: "Hủy", style: 'cancel' },
            { 
              text: "Gửi lại Email", 
              onPress: async () => {
                try {
                  await apiClient.post('/auth/resend-verification', { email: data.email });
                  Alert.alert("Thành công", "Đã gửi lại email xác thực.");
                } catch(e) {
                  Alert.alert("Lỗi", "Không thể gửi lại email lúc này.");
                }
              }
            }
          ]
        );
      } else {
        const message = errorData?.message || "Tài khoản hoặc mật khẩu không chính xác!";
        Alert.alert("Đăng nhập thất bại", message);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
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
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Logo / Brand */}
              <View style={styles.brandContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="bed" size={36} color={AppColors.accent} />
                </View>
                <Text style={styles.brandName}>LuxStay</Text>
                <Text style={styles.brandSlogan}>Khách sạn sang trọng, trải nghiệm đẳng cấp</Text>
              </View>

              {/* Form Card */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Đăng Nhập</Text>
                <Text style={styles.formSubtitle}>Chào mừng bạn quay trở lại</Text>

                {/* Email Input */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputWrapper}>
                      <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                        <Ionicons name="mail-outline" size={20} color={AppColors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          placeholder="Email của bạn"
                          placeholderTextColor={AppColors.textLight}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          style={styles.input}
                          value={value}
                          onChangeText={onChange}
                        />
                      </View>
                      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
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
                          placeholder="Mật khẩu"
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

                {/* Forgot Password */}
                <Link href="/(auth)/forgot-password" asChild>
                  <TouchableOpacity style={styles.forgotBtn}>
                    <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                  </TouchableOpacity>
                </Link>

                {/* Login Button */}
                <TouchableOpacity
                  disabled={isSubmitting}
                  onPress={handleSubmit(onSubmit)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={Gradients.button as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.loginButton, isSubmitting && styles.buttonDisabled]}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.loginButtonText}>ĐĂNG NHẬP</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>hoặc</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login */}
                <View style={styles.socialRow}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-google" size={22} color="#DB4437" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-facebook" size={22} color="#4267B2" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-apple" size={22} color="#000" />
                  </TouchableOpacity>
                </View>

                {/* Register Link */}
                <View style={styles.registerRow}>
                  <Text style={styles.registerText}>Chưa có tài khoản? </Text>
                  <Link href="/(auth)/register" asChild>
                    <TouchableOpacity>
                      <Text style={styles.registerLink}>Đăng ký ngay</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>

              {/* Hint */}
              <Text style={styles.hintText}>
                💡 Nhập admin@gmail.com để truy cập Admin Dashboard
              </Text>
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
    paddingBottom: Spacing.xxxl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: AppColors.accent,
  },
  brandName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: AppColors.textWhite,
    letterSpacing: 2,
  },
  brandSlogan: {
    fontSize: 14,
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
    fontSize: 26,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  inputWrapper: {
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    paddingHorizontal: Spacing.lg,
    height: 52,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
    marginTop: -Spacing.sm,
  },
  forgotText: {
    color: AppColors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
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
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.lg,
    color: AppColors.textLight,
    fontSize: 13,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: AppColors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: AppColors.accent,
    fontWeight: 'bold',
    fontSize: 14,
  },
  hintText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: Spacing.xl,
  },
});
