import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../../constants/theme';

const { width } = Dimensions.get('window');

// ═══════════════════════════════════════
// ROOM DATA
// ═══════════════════════════════════════
const ROOMS_DB: Record<string, any> = {
  '1': {
    name: 'Phòng Deluxe Ocean View', type: 'Phòng Đôi',
    price: '2.500.000', location: 'Đà Nẵng',
    rating: 4.8, reviews: 124,
    images: [
      require('../../../assets/images/room1.jpg'),
      require('../../../assets/images/nn1.jpg'),
      require('../../../assets/images/nn3.jpg'),
    ],
    description: 'Phòng Deluxe rộng rãi với tầm nhìn ra biển tuyệt đẹp. Được trang bị đầy đủ tiện nghi cao cấp, nội thất sang trọng và ban công riêng để bạn tận hưởng khung cảnh hoàng hôn tráng lệ. Diện tích 45m², tối đa 2 khách.',
    amenities: [
      { icon: 'wifi', label: 'WiFi miễn phí' },
      { icon: 'tv', label: 'Smart TV 55"' },
      { icon: 'snow-outline', label: 'Điều hòa' },
      { icon: 'water-outline', label: 'Hồ bơi' },
      { icon: 'restaurant-outline', label: 'Bữa sáng' },
      { icon: 'car-outline', label: 'Đỗ xe' },
      { icon: 'wine-outline', label: 'Minibar' },
      { icon: 'fitness-outline', label: 'Phòng Gym' },
    ],
  },
  '2': {
    name: 'Suite Tổng Thống', type: 'Suite',
    price: '8.000.000', location: 'Hà Nội',
    rating: 4.9, reviews: 89,
    images: [
      require('../../../assets/images/room2.jpg'),
      require('../../../assets/images/nn2.jpg'),
      require('../../../assets/images/nn1.jpg'),
    ],
    description: 'Suite Tổng Thống – đẳng cấp 5 sao với phòng khách riêng biệt, phòng ngủ master và phòng tắm Jacuzzi. Dịch vụ Butler 24/7, view toàn cảnh thành phố. Diện tích 120m², tối đa 4 khách.',
    amenities: [
      { icon: 'wifi', label: 'WiFi tốc độ cao' },
      { icon: 'tv', label: 'Smart TV 65"' },
      { icon: 'snow-outline', label: 'Điều hòa' },
      { icon: 'water-outline', label: 'Jacuzzi riêng' },
      { icon: 'restaurant-outline', label: 'Ẩm thực VIP' },
      { icon: 'car-outline', label: 'Xe đưa đón' },
      { icon: 'wine-outline', label: 'Rượu chào mừng' },
      { icon: 'fitness-outline', label: 'Spa & Gym' },
    ],
  },
};

const DEFAULT_ROOM = {
  name: 'Phòng Cao Cấp', type: 'Phòng Đơn',
  price: '1.500.000', location: 'Việt Nam',
  rating: 4.5, reviews: 50,
  images: [
    require('../../../assets/images/room3.jpg'),
    require('../../../assets/images/nn3.jpg'),
  ],
  description: 'Phòng được thiết kế hiện đại, ấm cúng với đầy đủ tiện nghi. Vị trí thuận lợi, giao thông dễ dàng. Diện tích 30m².',
  amenities: [
    { icon: 'wifi', label: 'WiFi' },
    { icon: 'tv', label: 'TV' },
    { icon: 'snow-outline', label: 'Điều hòa' },
    { icon: 'restaurant-outline', label: 'Bữa sáng' },
  ],
};

const MOCK_REVIEWS = [
  { id: '1', name: 'Nguyễn Văn A', avatar: '👨', rating: 5, date: '05/03/2026', comment: 'Phòng rất đẹp, view tuyệt vời! Nhân viên phục vụ chu đáo. Chắc chắn sẽ quay lại.' },
  { id: '2', name: 'Trần Thị B', avatar: '👩', rating: 4, date: '28/02/2026', comment: 'Phòng sạch sẽ, tiện nghi đầy đủ. Vị trí rất thuận tiện để di chuyển. Hơi ồn vào cuối tuần.' },
  { id: '3', name: 'Lê Minh C', avatar: '👨‍💼', rating: 5, date: '15/02/2026', comment: 'Trải nghiệm tuyệt vời cho kỳ nghỉ gia đình. Bữa sáng đa dạng và ngon.' },
];

const StarRating = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= Math.floor(rating) ? 'star' : star - 0.5 <= rating ? 'star-half' : 'star-outline'}
        size={size}
        color={AppColors.star}
      />
    ))}
  </View>
);

export default function RoomDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const room = ROOMS_DB[id as string] || DEFAULT_ROOM;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ═══ IMAGE GALLERY ═══ */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(idx);
            }}
          >
            {room.images.map((img: any, idx: number) => (
              <Image key={idx} source={img} style={styles.galleryImage} />
            ))}
          </ScrollView>

          {/* Overlay buttons */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? AppColors.danger : "#fff"} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-outline" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Image indicators */}
          <View style={styles.imageIndicators}>
            {room.images.map((_: any, idx: number) => (
              <View
                key={idx}
                style={[styles.indicator, activeImageIndex === idx && styles.indicatorActive]}
              />
            ))}
          </View>

          {/* Image counter */}
          <View style={styles.imageCounter}>
            <Ionicons name="images-outline" size={14} color="#fff" />
            <Text style={styles.imageCounterText}>{activeImageIndex + 1}/{room.images.length}</Text>
          </View>
        </View>

        {/* ═══ ROOM INFO ═══ */}
        <View style={styles.infoSection}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{room.type}</Text>
          </View>
          <Text style={styles.roomName}>{room.name}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={AppColors.secondary} />
            <Text style={styles.locationText}>{room.location}</Text>
          </View>

          <View style={styles.ratingRow}>
            <StarRating rating={room.rating} size={16} />
            <Text style={styles.ratingValue}>{room.rating}</Text>
            <Text style={styles.reviewCount}>({room.reviews} đánh giá)</Text>
          </View>
        </View>

        {/* ═══ DESCRIPTION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{room.description}</Text>
        </View>

        {/* ═══ AMENITIES ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiện nghi</Text>
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((amenity: any, idx: number) => (
              <View key={idx} style={styles.amenityCard}>
                <View style={styles.amenityIconContainer}>
                  <Ionicons name={amenity.icon} size={22} color={AppColors.primary} />
                </View>
                <Text style={styles.amenityLabel}>{amenity.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ═══ REVIEWS ═══ */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đánh giá</Text>
            <View style={styles.overallRating}>
              <Ionicons name="star" size={16} color={AppColors.star} />
              <Text style={styles.overallRatingText}>{room.rating}/5</Text>
            </View>
          </View>

          {MOCK_REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={{ fontSize: 24 }}>{review.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewName}>{review.name}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <StarRating rating={review.rating} size={12} />
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ═══ FIXED BOTTOM BAR ═══ */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPriceLabel}>Giá mỗi đêm</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={styles.bottomPrice}>{room.price}đ</Text>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/booking')}
        >
          <LinearGradient
            colors={Gradients.button as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookButton}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.bookButtonText}>Đặt Ngay</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  // ─── Gallery ───
  galleryContainer: {
    position: 'relative',
    height: 300,
  },
  galleryImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favBtn: {
    position: 'absolute',
    top: 48,
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtn: {
    position: 'absolute',
    top: 48,
    right: 68,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // ─── Info ───
  infoSection: {
    padding: Spacing.xl,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  typeBadgeText: {
    color: AppColors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  roomName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  locationText: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingValue: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  reviewCount: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  // ─── Sections ───
  section: {
    padding: Spacing.xl,
    backgroundColor: '#fff',
    marginTop: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 15,
    color: AppColors.textSecondary,
    lineHeight: 24,
  },
  // ─── Amenities ───
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  amenityCard: {
    width: (width - Spacing.xl * 2 - Spacing.md * 3) / 4,
    alignItems: 'center',
    gap: 6,
  },
  amenityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenityLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  // ─── Reviews ───
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppColors.star + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  overallRatingText: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  reviewCard: {
    backgroundColor: AppColors.background,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  reviewDate: {
    fontSize: 12,
    color: AppColors.textLight,
  },
  reviewComment: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 21,
  },
  // ─── Bottom Bar ───
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
    ...Shadows.large,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: Radius.md,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
