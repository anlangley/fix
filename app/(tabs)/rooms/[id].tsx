import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../../constants/theme';
import { apiClient } from '../../../services/api';

const { width } = Dimensions.get('window');

const StarRating = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= Math.floor(rating) ? 'star' : star - 0.5 <= Math.floor(rating + 0.5) ? 'star-half' : 'star-outline'}
        size={size}
        color={AppColors.star}
      />
    ))}
  </View>
);

export default function RoomDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchRoomDetail();
    checkFavoriteStatus();
  }, [id]);

  const fetchRoomDetail = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/rooms/${id}`);
      if (response.data?.success) {
        setRoom(response.data.data.room);
      }
    } catch (error) {
      console.error('Error fetching room detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const res = await apiClient.get(`/favorites/check/${id}`);
      if (res.data?.success) {
        setIsFavorite(res.data.data.isFavorited);
      }
    } catch (error) {
      // Nếu chưa login thì bỏ qua
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await apiClient.delete(`/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await apiClient.post(`/favorites/${id}`);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={{ marginTop: 10, color: AppColors.textSecondary }}>Đang tải thông tin phòng...</Text>
      </View>
    );
  }

  if (!room) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={64} color={AppColors.danger} />
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>Không tìm thấy phòng!</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}>
          <Text style={{ color: AppColors.accent }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const roomImages = room.images?.length > 0 
    ? room.images.map((img: any) => ({ uri: img.url }))
    : [require('../../../assets/images/room1.jpg')];
  
  const amenities = room.amenities || [];
  const reviews = room.reviews || [];

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
            {roomImages.map((img: any, idx: number) => (
              <Image key={idx} source={img} style={styles.galleryImage} />
            ))}
          </ScrollView>


          {/* Overlay buttons */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favBtn}
            onPress={toggleFavorite}
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
            <StarRating rating={room.avgRating || 0} size={16} />
            <Text style={styles.ratingValue}>{room.avgRating || 0}</Text>
            <Text style={styles.reviewCount}>({room.reviewCount || 0} đánh giá)</Text>
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
            {amenities.map((amenity: any, idx: number) => (
              <View key={idx} style={styles.amenityCard}>
                <View style={styles.amenityIconContainer}>
                  <Ionicons name={amenity.icon || 'help-outline'} size={22} color={AppColors.primary} />
                </View>
                <Text style={styles.amenityLabel}>{amenity.name || amenity.label}</Text>
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
              <Text style={styles.overallRatingText}>{room.avgRating || 0}/5</Text>
            </View>
          </View>

          {reviews.map((review: any) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  {review.user?.avatarUrl ? (
                    <Image source={{ uri: review.user.avatarUrl }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                  ) : (
                    <Text style={{ fontSize: 24 }}>👤</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewName}>{review.user?.name || 'Ẩn danh'}</Text>
                  <Text style={styles.reviewDate}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}</Text>
                </View>
                <StarRating rating={review.rating} size={12} />
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
          {reviews.length === 0 && (
            <Text style={{ textAlign: 'center', color: AppColors.textLight, marginTop: 20 }}>
              Chưa có đánh giá nào cho phòng này.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* ═══ FIXED BOTTOM BAR ═══ */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPriceLabel}>Giá mỗi đêm</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={styles.bottomPrice}>{Number(room.pricePerNight).toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push({
            pathname: '/(tabs)/booking',
            params: { roomId: room.id }
          })}
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
