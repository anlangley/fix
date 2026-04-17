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
  { id: 'vietqr', name: 'VietQR (MB Bank)', desc: 'Chuyển khoản qua MB Bank', icon: null, color: '#005BAA' },
];

export default function PaymentScreen() {
  const { bookingId: initialBookingId, bookingData: rawBookingData } = useLocalSearchParams<{ bookingId: string, bookingData: string }>();
  const router = useRouter();

  const [booking, setBooking] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string | null>(initialBookingId || null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('vietqr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else if (rawBookingData) {
      try {
        const parsedData = JSON.parse(rawBookingData);
        setBooking({
          room: { name: parsedData.roomName },
          checkInDate: parsedData.checkInDate,
          checkOutDate: parsedData.checkOutDate,
          nightCount: parsedData.nightCount,
          roomsCount: parsedData.roomsCount,
          guestsCount: parsedData.guestsCount,
          totalPrice: parsedData.totalPrice,
          _raw: parsedData,
        });
        setIsLoading(false);
      } catch (e) {
        console.error('Error parsing booking data:', e);
        Alert.alert('Lỗi', 'Dữ liệu đặt phòng không hợp lệ.');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [bookingId, rawBookingData]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/bookings/my-bookings`);
      if (response.data?.success) {
        const found = response.data.data.bookings.find((b: any) => b.id === bookingId);
        if (found) setBooking(found);
      }
    } catch (error) {
      console.error('Error fetching booking for payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      
      let currentBookingId = bookingId;

      // BƯỚC 1: Nếu chưa có booking Id, lưu vào DB
      if (!currentBookingId && booking?._raw) {
        const { roomName, nightCount, totalPrice, ...cleanData } = booking._raw;
        const createRes = await apiClient.post('/bookings', cleanData);
        if (createRes.data?.success) {
          currentBookingId = createRes.data.data.booking.id;
          setBookingId(currentBookingId);
        } else {
          throw new Error('Không thể khởi tạo đặt phòng.');
        }
      }

      if (!currentBookingId) return;

      // BƯỚC 2: Gọi API lấy mã VietQR
      const response = await apiClient.post('/payments/vietqr/create', { bookingId: currentBookingId });

      if (response.data?.success) {
        setQrData(response.data.data);
        setShowQRModal(true);
      }
    } catch (error: any) {
      console.error('VietQR creation failed:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo mã thanh toán.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmTransfer = async () => {
    try {
      setIsConfirming(true);
      const response = await apiClient.post('/payments/confirm', { bookingId });
      if (response.data?.success) {
        setShowQRModal(false);
        setShowSuccess(true);
      }
    } catch (error: any) {
      console.error('Confirmation failed:', error);
      Alert.alert('Lỗi', 'Không thể gửi xác nhận. Vui lòng thử lại sau.');
    } finally {
      setIsConfirming(false);
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
                <Ionicons name="qr-code-outline" size={24} color={method.color} />
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
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.payBtnText}>Thanh toán {formatCurrency(total)}đ</Text>
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
              onPress={() => setShowQRModal(false)}
            >
              <Ionicons name="close" size={24} color={AppColors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.bankHeader}>
              <View style={styles.bankLogo}>
                <Ionicons name="business" size={30} color={AppColors.primary} />
              </View>
              <View>
                <Text style={styles.bankName}>MB Bank (VietQR)</Text>
                <Text style={styles.accountNo}>STK: {qrData?.accountNo}</Text>
              </View>
            </View>
            
            <Text style={styles.successTitle}>Quét mã VietQR</Text>
            <Text style={styles.successDesc}>
              Sử dụng ứng dụng Ngân hàng để quét mã QR và xác nhận chuyển khoản.
            </Text>

            <View style={styles.qrContainer}>
              {qrData?.qrCodeUrl ? (
                <Image source={{ uri: qrData.qrCodeUrl }} style={styles.qrImage} />
              ) : (
                <ActivityIndicator size="large" color={AppColors.primary} />
              )}
            </View>

            <View style={styles.transferDetail}>
                <Text style={styles.detailLabel}>Nội dung:</Text>
                <Text style={styles.detailValue}>{qrData?.description}</Text>
            </View>

            <Text style={styles.qrAmount}>
              {formatCurrency(total)}đ
            </Text>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmTransfer}
              disabled={isConfirming}
            >
              <LinearGradient colors={['#059669', '#047857']} style={styles.confirmGradient}>
                {isConfirming ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.confirmBtnText}>Xác nhận đã chuyển khoản</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.modalHint}>
              Sau khi chuyển khoản, nhấn nút xác nhận bên trên để Admin kiểm tra nhé!
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
            <Text style={styles.successTitle}>Đã gửi xác nhận! 🎉</Text>
            <Text style={styles.successDesc}>
              Cảm ơn bạn đã thanh toán. Hệ thống đang chờ Admin kiểm tra và duyệt đặt phòng của bạn trong ít phút.
            </Text>
            <View style={styles.successInfo}>
              <View style={styles.successInfoRow}>
                <Text style={styles.successInfoLabel}>Mã đặt phòng</Text>
                <Text style={styles.successInfoValue}>
                  {bookingId ? `#LUX-${bookingId.slice(-6).toUpperCase()}` : 'N/A'}
                </Text>
              </View>
              <View style={styles.successInfoRow}>
                <Text style={styles.successInfoLabel}>Tổng tiền</Text>
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
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, alignItems: 'center', width: '100%',
  },
  bankHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15, alignSelf: 'flex-start' },
  bankLogo: { width: 44, height: 44, borderRadius: 22, backgroundColor: AppColors.background, justifyContent: 'center', alignItems: 'center' },
  bankName: { fontSize: 16, fontWeight: 'bold', color: AppColors.textPrimary },
  accountNo: { fontSize: 13, color: AppColors.textSecondary },
  
  qrContainer: { padding: 15, backgroundColor: '#fff', borderRadius: Radius.lg, ...Shadows.medium, marginVertical: 10 },
  qrImage: { width: 220, height: 220 },
  qrAmount: { fontSize: 24, fontWeight: 'bold', color: AppColors.primary, marginTop: 10 },
  
  transferDetail: { flexDirection: 'row', gap: 6, marginTop: 5 },
  detailLabel: { fontSize: 13, color: AppColors.textSecondary },
  detailValue: { fontSize: 13, fontWeight: '700', color: AppColors.accent },

  confirmBtn: { width: '100%', marginTop: 25 },
  confirmGradient: { height: 50, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  modalHint: { marginTop: 15, fontSize: 12, color: AppColors.textLight, textAlign: 'center' },

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
});
