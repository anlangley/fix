import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, Modal, Dimensions, ActivityIndicator, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../../constants/theme';
import { apiClient } from '../../../services/api';

const { width } = Dimensions.get('window');

const PAYMENT_METHODS = [
  { id: 'momo', name: 'MoMo', desc: 'Ví điện tử MoMo', icon: require('../../../assets/images/momo-logo.png'), color: '#A50064' },
  { id: 'vnpay', name: 'VNPay', desc: 'Thanh toán VNPay', icon: require('../../../assets/images/vnpay-logo.png'), color: '#005BAA' },
  { id: 'zalopay', name: 'ZaloPay', desc: 'Ví ZaloPay', icon: require('../../../assets/images/zalo-pay-logo.png'), color: '#008FE5' },
  { id: 'card', name: 'Thẻ tín dụng', desc: 'Visa / Mastercard', icon: null, color: '#1A1D2E' },
];

export default function PaymentScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();

  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<any>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/payments/status/${bookingId}`);
      if (response.data?.success) {
        setBooking(response.data.data.booking);
      }
    } catch (error) {
      console.error('Error fetching booking for payment:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin đơn hàng.');
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    const interval = setInterval(async () => {
      try {
        const response = await apiClient.get(`/payments/status/${bookingId}`);
        if (response.data?.success && response.data.data.booking.paymentStatus === 'PAID') {
          clearInterval(interval);
          setPollingInterval(null);
          setShowQRModal(false);
          setShowSuccess(true);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
    setPollingInterval(interval);
  };

  const handlePayment = async () => {
    if (selectedMethod !== 'momo') {
      Alert.alert('Thông báo', 'Phương thức này đang được bảo trì. Vui lòng chọn MoMo.');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await apiClient.post('/payments/momo/create', { bookingId });

      if (response.data?.success) {
        setQrData(response.data.data);
        setShowQRModal(true);
        startPolling(); // Bắt đầu kiểm tra trạng thái thanh toán tự động
      }
    } catch (error: any) {
      console.error('Momo creation failed:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể khởi tạo thanh toán MoMo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenMomo = () => {
    if (qrData?.payUrl) {
      Linking.openURL(qrData.payUrl);
    }
  };

  const formatCurrency = (n: number) => Number(n || 0).toLocaleString('vi-VN');

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  const total = Number(booking?.totalPrice || 0);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh Toán</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Tóm tắt đơn hàng</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phòng</Text>
              <Text style={styles.summaryValue}>{booking?.room?.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Check-in</Text>
              <Text style={styles.summaryValue}>{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Check-out</Text>
              <Text style={styles.summaryValue}>{new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Số đêm</Text>
              <Text style={styles.summaryValue}>{booking.nightCount} đêm</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phòng x Khách</Text>
              <Text style={styles.summaryValue}>{booking.roomsCount} x {booking.guestsCount}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}đ</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <Text style={styles.sectionTitle}>💳 Phương thức thanh toán</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentCard,
                selectedMethod === method.id && styles.paymentCardActive,
              ]}
              onPress={() => setSelectedMethod(method.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.paymentIconContainer, { backgroundColor: method.color + '10' }]}>
                {method.icon ? (
                  <Image source={method.icon} style={styles.paymentIcon} />
                ) : (
                  <Ionicons name="card-outline" size={24} color={method.color} />
                )}
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>{method.name}</Text>
                <Text style={styles.paymentDesc}>{method.desc}</Text>
              </View>
              <View style={[
                styles.radioOuter,
                selectedMethod === method.id && styles.radioOuterActive,
              ]}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Thanh toán qua</Text>
          <Text style={styles.bottomMethod}>{PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={[AppColors.success, '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.payBtn, isProcessing && { opacity: 0.7 }]}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={20} color="#fff" />
                <Text style={styles.payBtnText}>Xác nhận {formatCurrency(total)}đ</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* QR Code Modal */}
      <Modal visible={showQRModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={{ alignSelf: 'flex-end', padding: 10 }}
              onPress={() => {
                setShowQRModal(false);
                if (pollingInterval) clearInterval(pollingInterval);
              }}
            >
              <Ionicons name="close" size={24} color={AppColors.textSecondary} />
            </TouchableOpacity>

            <Image source={require('../../../assets/images/momo-logo.png')} style={{ width: 60, height: 60, marginBottom: 10 }} />
            <Text style={styles.successTitle}>Quét mã MoMo</Text>
            <Text style={[styles.successDesc, { marginBottom: 20 }]}>
              Dùng ứng dụng MoMo để quét mã QR bên dưới để hoàn tất thanh toán.
            </Text>

            <View style={{ padding: 20, backgroundColor: '#fff', borderRadius: Radius.lg, ...Shadows.medium }}>
              {qrData?.qrCodeUrl ? (
                <Image source={{ uri: qrData.qrCodeUrl }} style={{ width: 220, height: 220 }} />
              ) : (
                <ActivityIndicator size="large" color={AppColors.primary} />
              )}
            </View>

            <Text style={{ fontSize: 20, fontWeight: 'bold', color: AppColors.primary, marginTop: 20 }}>
              {formatCurrency(total)}đ
            </Text>

            <TouchableOpacity
              style={[styles.successBtn, { backgroundColor: '#A50064' }]}
              onPress={handleOpenMomo}
            >
              <Text style={[styles.successBtnText, { color: '#fff' }]}>Mở ứng dụng MoMo</Text>
            </TouchableOpacity>

            <Text style={{ marginTop: 20, fontSize: 12, color: AppColors.textLight }}>
              Hệ thống đang kiểm tra trạng thái thanh toán...
            </Text>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">

        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark-circle" size={64} color={AppColors.success} />
            </View>
            <Text style={styles.successTitle}>Thanh Toán Thành Công! 🎉</Text>
            <Text style={styles.successDesc}>
              Đơn đặt phòng của bạn đã được xác nhận. Chúng tôi đã gửi email xác nhận đến hộp thư của bạn.
            </Text>
            <View style={styles.successInfo}>
              <View style={styles.successInfoRow}>
                <Text style={styles.successInfoLabel}>Mã đặt phòng</Text>
                <Text style={styles.successInfoValue}>#LUX-2026-0411</Text>
              </View>
              <View style={styles.successInfoRow}>
                <Text style={styles.successInfoLabel}>Tổng thanh toán</Text>
                <Text style={styles.successInfoValue}>{formatCurrency(total)}đ</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => {
                setShowSuccess(false);
                router.replace('/(tabs)');
              }}
            >
              <LinearGradient
                colors={Gradients.button as [string, string]}
                style={styles.successBtnGradient}
              >
                <Text style={styles.successBtnText}>Về Trang Chủ</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowSuccess(false);
                router.push('/(tabs)/history');
              }}
              style={{ marginTop: Spacing.md }}
            >
              <Text style={styles.viewHistoryLink}>Xem lịch sử đặt phòng →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  section: { marginHorizontal: Spacing.lg, marginTop: Spacing.xl },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: AppColors.textPrimary, marginBottom: Spacing.md },

  summaryCard: { backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.lg, ...Shadows.small },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  summaryLabel: { fontSize: 14, color: AppColors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: AppColors.textPrimary },
  summaryDivider: { height: 1, backgroundColor: AppColors.border, marginVertical: Spacing.sm },
  totalLabel: { fontSize: 16, fontWeight: '700', color: AppColors.textPrimary },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: AppColors.accent },

  paymentCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: Radius.md,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 2, borderColor: 'transparent', ...Shadows.small,
  },
  paymentCardActive: { borderColor: AppColors.accent, backgroundColor: AppColors.accent + '08' },
  paymentIconContainer: {
    width: 48, height: 48, borderRadius: Radius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  paymentIcon: { width: 32, height: 32, resizeMode: 'contain' },
  paymentInfo: { flex: 1, marginLeft: Spacing.md },
  paymentName: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary },
  paymentDesc: { fontSize: 12, color: AppColors.textSecondary, marginTop: 2 },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: AppColors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioOuterActive: { borderColor: AppColors.accent },
  radioInner: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: AppColors.accent,
  },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, paddingBottom: 30,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: AppColors.borderLight,
    ...Shadows.large,
  },
  bottomLabel: { fontSize: 12, color: AppColors.textSecondary },
  bottomMethod: { fontSize: 16, fontWeight: '700', color: AppColors.textPrimary },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: Radius.md,
  },
  payBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl,
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: Radius.xl,
    padding: Spacing.xxl, alignItems: 'center', width: '100%',
  },
  successCircle: { marginBottom: Spacing.lg },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: AppColors.textPrimary, textAlign: 'center' },
  successDesc: {
    fontSize: 14, color: AppColors.textSecondary,
    textAlign: 'center', marginTop: Spacing.sm, lineHeight: 21,
  },
  successInfo: {
    width: '100%', backgroundColor: AppColors.background,
    borderRadius: Radius.md, padding: Spacing.lg, marginTop: Spacing.xl,
  },
  successInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  successInfoLabel: { fontSize: 13, color: AppColors.textSecondary },
  successInfoValue: { fontSize: 14, fontWeight: '700', color: AppColors.textPrimary },
  successBtn: { width: '100%', marginTop: Spacing.xl },
  successBtnGradient: {
    alignItems: 'center', justifyContent: 'center',
    height: 50, borderRadius: Radius.md,
  },
  successBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  viewHistoryLink: { color: AppColors.accent, fontSize: 14, fontWeight: '600' },
});
