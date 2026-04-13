import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../../constants/theme';
import { apiClient } from '../../../services/api';

export default function BookingForm() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  
  const [room, setRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [checkIn, setCheckIn] = useState('15/04/2026');
  const [checkOut, setCheckOut] = useState('17/04/2026');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [specialRequest, setSpecialRequest] = useState('');

  useEffect(() => {
    if (roomId) {
      fetchRoomInfo();
    }
  }, [roomId]);

  const fetchRoomInfo = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/rooms/${roomId}`);
      if (response.data?.success) {
        setRoom(response.data.data.room);
      }
    } catch (error) {
      console.error('Error fetching room info for booking:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin phòng. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async () => {
    try {
      setIsSubmitting(true);
      
      // Chuyển đổi ngày sang định dạng ISO cho Backend (phần này có thể cần date picker thực tế hơn)
      // Tạm thời giả định định dạng dd/mm/yyyy -> yyyy-mm-dd
      const [inD, inM, inY] = checkIn.split('/');
      const [outD, outM, outY] = checkOut.split('/');
      const isoCheckIn = `${inY}-${inM}-${inD}`;
      const isoCheckOut = `${outY}-${outM}-${outD}`;

      const bookingData = {
        roomId,
        checkInDate: isoCheckIn,
        checkOutDate: isoCheckOut,
        guestsCount: guests,
        roomsCount: rooms,
        specialRequest,
        paymentMethod: 'MOMO', // Mặc định MoMo
      };

      const response = await apiClient.post('/bookings', bookingData);
      
      if (response.data?.success) {
        const bookingId = response.data.data.booking.id;
        router.push({
          pathname: '/(tabs)/booking/payment',
          params: { bookingId }
        });
      }
    } catch (error: any) {
      console.error('Booking failed:', error);
      const errMsg = error.response?.data?.message || 'Có lỗi xảy ra khi đặt phòng.';
      Alert.alert('Đặt phòng thất bại', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roomPrice = room ? Number(room.pricePerNight) : 0;
  const nights = 2; // Tạm thời fix cứng số đêm hoặc cần tính toán từ ngày
  const subtotal = roomPrice * nights * rooms;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const formatCurrency = (n: number) => n.toLocaleString('vi-VN');

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đặt Phòng</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* Room Summary Card */}
        <View style={styles.roomSummary}>
          <Image 
            source={room?.images?.[0]?.url ? { uri: room.images[0].url } : require('../../../assets/images/room1.jpg')} 
            style={styles.roomImage} 
          />
          <View style={styles.roomInfo}>
            <Text style={styles.roomName}>{room?.name || 'Đang tải...'}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={AppColors.textSecondary} />
              <Text style={styles.locationText}>{room?.location}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={AppColors.star} />
              <Text style={styles.ratingText}>{room?.avgRating} ({room?.reviewCount} đánh giá)</Text>
            </View>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Ngày lưu trú</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateCard}>
              <Text style={styles.dateLabel}>Nhận phòng</Text>
              <View style={styles.dateInputContainer}>
                <Ionicons name="calendar-outline" size={18} color={AppColors.accent} />
                <TextInput
                  style={styles.dateInput}
                  value={checkIn}
                  onChangeText={setCheckIn}
                  placeholder="dd/mm/yyyy"
                />
              </View>
              <Text style={styles.dateHint}>14:00</Text>
            </View>
            <View style={styles.dateArrow}>
              <Ionicons name="arrow-forward" size={20} color={AppColors.textLight} />
              <Text style={styles.nightCount}>{nights} đêm</Text>
            </View>
            <View style={styles.dateCard}>
              <Text style={styles.dateLabel}>Trả phòng</Text>
              <View style={styles.dateInputContainer}>
                <Ionicons name="calendar-outline" size={18} color={AppColors.accent} />
                <TextInput
                  style={styles.dateInput}
                  value={checkOut}
                  onChangeText={setCheckOut}
                  placeholder="dd/mm/yyyy"
                />
              </View>
              <Text style={styles.dateHint}>12:00</Text>
            </View>
          </View>
        </View>

        {/* Guests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Số lượng</Text>
          <View style={styles.guestRow}>
            <View style={styles.guestItem}>
              <View>
                <Text style={styles.guestLabel}>Khách</Text>
                <Text style={styles.guestSubLabel}>Người lớn</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setGuests(Math.max(1, guests - 1))}
                >
                  <Ionicons name="remove" size={18} color={AppColors.primary} />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{guests}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setGuests(Math.min(room?.capacityAdults || 10, guests + 1))}
                >
                  <Ionicons name="add" size={18} color={AppColors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.guestDivider} />
            <View style={styles.guestItem}>
              <View>
                <Text style={styles.guestLabel}>Phòng</Text>
                <Text style={styles.guestSubLabel}>Số lượng</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setRooms(Math.max(1, rooms - 1))}
                >
                  <Ionicons name="remove" size={18} color={AppColors.primary} />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{rooms}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setRooms(Math.min(5, rooms + 1))}
                >
                  <Ionicons name="add" size={18} color={AppColors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Special Request */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Yêu cầu đặc biệt</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="VD: Phòng tầng cao, giường phụ cho trẻ em..."
            placeholderTextColor={AppColors.textLight}
            value={specialRequest}
            onChangeText={setSpecialRequest}
          />
        </View>

        {/* Price Breakdown */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={styles.sectionTitle}>💰 Chi tiết giá</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{room?.name} × {nights} đêm</Text>
              <Text style={styles.priceValue}>{formatCurrency(subtotal)}đ</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Thuế & Phí dịch vụ (10%)</Text>
              <Text style={styles.priceValue}>{formatCurrency(tax)}đ</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}đ</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Tổng thanh toán</Text>
          <Text style={styles.bottomPrice}>{formatCurrency(total)}đ</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBooking}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={Gradients.button as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.continueBtn, isSubmitting && { opacity: 0.7 }]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.continueBtnText}>Tiếp tục</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },

  roomSummary: {
    flexDirection: 'row', backgroundColor: '#fff',
    margin: Spacing.lg, borderRadius: Radius.lg,
    overflow: 'hidden', ...Shadows.medium,
  },
  roomImage: { width: 110, height: 100 },
  roomInfo: { flex: 1, padding: Spacing.md, justifyContent: 'center' },
  roomName: { fontSize: 15, fontWeight: '700', color: AppColors.textPrimary, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  locationText: { fontSize: 12, color: AppColors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, color: AppColors.textSecondary },

  section: { marginHorizontal: Spacing.lg, marginTop: Spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: AppColors.textPrimary, marginBottom: Spacing.md },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dateCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: Radius.md,
    padding: Spacing.md, ...Shadows.small,
  },
  dateLabel: { fontSize: 12, color: AppColors.textSecondary, marginBottom: 6 },
  dateInputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderBottomWidth: 1, borderBottomColor: AppColors.borderLight, paddingBottom: 6,
  },
  dateInput: { flex: 1, fontSize: 15, fontWeight: '600', color: AppColors.textPrimary },
  dateHint: { fontSize: 11, color: AppColors.textLight, marginTop: 4 },
  dateArrow: { alignItems: 'center', gap: 2 },
  nightCount: { fontSize: 10, color: AppColors.textLight, fontWeight: '600' },

  guestRow: { backgroundColor: '#fff', borderRadius: Radius.md, ...Shadows.small },
  guestItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: Spacing.lg,
  },
  guestLabel: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary },
  guestSubLabel: { fontSize: 12, color: AppColors.textSecondary },
  guestDivider: { height: 1, backgroundColor: AppColors.borderLight, marginHorizontal: Spacing.lg },
  stepper: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: AppColors.background, borderRadius: Radius.sm, padding: 4,
  },
  stepperBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    ...Shadows.small,
  },
  stepperValue: { fontSize: 18, fontWeight: '700', color: AppColors.textPrimary, minWidth: 24, textAlign: 'center' },

  textArea: {
    backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.lg,
    fontSize: 14, color: AppColors.textPrimary, minHeight: 80,
    textAlignVertical: 'top', ...Shadows.small,
  },

  priceCard: { backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.lg, ...Shadows.small },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  priceLabel: { fontSize: 14, color: AppColors.textSecondary },
  priceValue: { fontSize: 14, fontWeight: '600', color: AppColors.textPrimary },
  priceDivider: { height: 1, backgroundColor: AppColors.border, marginVertical: Spacing.sm },
  totalLabel: { fontSize: 16, fontWeight: '700', color: AppColors.textPrimary },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: AppColors.accent },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, paddingBottom: 30,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: AppColors.borderLight,
    ...Shadows.large,
  },
  bottomLabel: { fontSize: 12, color: AppColors.textSecondary },
  bottomPrice: { fontSize: 22, fontWeight: 'bold', color: AppColors.primary },
  continueBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: Radius.md,
  },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
