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
import { router } from 'expo-router';
import { AppColors, Gradients, Shadows, Radius, Spacing } from '../../constants/theme';

const { width } = Dimensions.get('window');

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập Email').email('Email không đúng định dạng'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email: data.email,
      });

      if (response.data.success) {
        Alert.alert(
          "Đã gửi yêu cầu",
          "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.",
          [
            { 
              text: "OK", 
              onPress: () => router.push({
                pathname: '/(auth)/reset-password',
                params: { email: data.email }
              }) 
            }
          ]
        );
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      const message = error.response?.data?.message || error.message || "Có lỗi xảy ra, vui lòng thử lại sau.";
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
                  <Ionicons name="key-outline" size={36} color={AppColors.accent} />
                </View>
                <Text style={styles.brandName}>Quên Mật Khẩu</Text>
                <Text style={styles.brandSlogan}>Nhập email để nhận mã đặt lại mật khẩu</Text>
              </View>

              <View style={styles.formCard}>
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
                      <Text style={styles.submitButtonText}>GỬI YÊU CẦU</Text>
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
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2, borderColor: AppColors.accent,
  },
  brandName: {
    fontSize: 28, fontWeight: 'bold', color: AppColors.textWhite,
  },
  brandSlogan: {
    fontSize: 14, color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.xs, textAlign: 'center',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    ...Shadows.large,
  },
  inputWrapper: { marginBottom: Spacing.xl },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AppColors.background,
    borderRadius: Radius.md, borderWidth: 1.5,
    borderColor: AppColors.border,
    paddingHorizontal: Spacing.lg, height: 52,
  },
  inputIcon: { marginRight: Spacing.md },
  input: { flex: 1, fontSize: 15, color: AppColors.textPrimary },
  inputError: { borderColor: AppColors.danger, backgroundColor: AppColors.dangerLight },
  errorText: { color: AppColors.danger, fontSize: 12, marginTop: 4, marginLeft: 4 },
  submitButton: {
    height: 52, borderRadius: Radius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});
