import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Dimensions, Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppColors, Gradients, Radius, Shadows, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

// ═══════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════
const BANNERS = [
  { id: '1', image: require('../../assets/images/nn1.jpg'), title: 'Giảm 30% Cuối Tuần', subtitle: 'Đặt ngay hôm nay' },
  { id: '2', image: require('../../assets/images/nn2.jpg'), title: 'Combo Nghỉ Dưỡng', subtitle: 'Từ 1.200.000đ/đêm' },
  { id: '3', image: require('../../assets/images/nn3.jpg'), title: 'Ưu đãi Mùa Hè', subtitle: 'Giảm tới 50%' },
];

const CATEGORIES = [
  { id: '1', name: 'Phòng Đơn', icon: 'person' as const, color: '#3B82F6' },
  { id: '2', name: 'Phòng Đôi', icon: 'people' as const, color: '#8B5CF6' },
  { id: '3', name: 'Suite', icon: 'star' as const, color: '#F59E0B' },
  { id: '4', name: 'VIP', icon: 'diamond' as const, color: '#EF4444' },
];

const FEATURED_ROOMS = [
  {
    id: '1', name: 'Phòng Deluxe Ocean View',
    price: '2.500.000', image: require('../../assets/images/room1.jpg'),
    rating: 4.8, reviews: 124, location: 'Đà Nẵng',
    badge: 'Hot Deal',
  },
  {
    id: '2', name: 'Suite Tổng Thống',
    price: '8.000.000', image: require('../../assets/images/room2.jpg'),
    rating: 4.9, reviews: 89, location: 'Hà Nội',
    badge: 'Premium',
  },
  {
    id: '3', name: 'Phòng Superior Garden',
    price: '1.800.000', image: require('../../assets/images/room3.jpg'),
    rating: 4.6, reviews: 256, location: 'Hồ Chí Minh',
    badge: null,
  },
];

const DEALS = [
  {
    id: '1', name: 'Flash Sale Cuối Tuần',
    discount: '-40%', image: require('../../assets/images/room1.jpg'),
    originalPrice: '3.000.000', salePrice: '1.800.000',
  },
  {
    id: '2', name: 'Combo Gia Đình',
    discount: '-25%', image: require('../../assets/images/room2.jpg'),
    originalPrice: '5.000.000', salePrice: '3.750.000',
  },
];

// ═══════════════════════════════════════
// STAR RATING COMPONENT
// ═══════════════════════════════════════
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

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [featuredRooms, setFeaturedRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Date Picker State ──
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<'checkIn' | 'checkOut' | null>(null);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

  useEffect(() => {
    fetchFeaturedRooms();
    fetchFavoriteIds();
    fetchUserProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchUnreadNotifCount();
      }
    }, [user])
  );

  const fetchUnreadNotifCount = async () => {
    try {
      if (!user) return;
      const response = await apiClient.get('/notifications/unread-count');
      if (response.data?.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (error) {
      // Chỉ log lỗi nếu không phải là lỗi 401 (để tránh rác console khi logout)
      if (error.response?.status !== 401) {
        console.error('Error fetching unread count:', error);
      }
    }
  };

  const fetchFeaturedRooms = async () => {
    try {
      const response = await apiClient.get('/rooms?limit=5');
      if (response.data?.success) {
        setFeaturedRooms(response.data.data.rooms);
      }
    } catch (error) {
      console.log('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavoriteIds = async () => {
    try {
      if (!user) return;
      const res = await apiClient.get('/favorites');
      if (res.data?.success) {
        const ids = new Set<string>(res.data.data.favorites.map((f: any) => f.room.id));
        setFavoriteIds(ids);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error fetching favorites:', error);
      }
    }
  };

  const fetchUserProfile = async () => {
    try {
      if (!user) return;
      const res = await apiClient.get('/auth/me');
      if (res.data?.success) {
        setAvatarUrl(res.data.data.user.avatarUrl || null);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error fetching profile:', error);
      }
    }
  };

  const toggleFavorite = async (roomId: string) => {
    try {
      const isFav = favoriteIds.has(roomId);
      // Optimistic UI
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (isFav) next.delete(roomId);
        else next.add(roomId);
        return next;
      });

      if (isFav) {
        await apiClient.delete(`/favorites/${roomId}`);
      } else {
        await apiClient.post(`/favorites/${roomId}`);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      // Revert on error
      fetchFavoriteIds();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ═══ HEADER ═══ */}
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person" size={22} color={AppColors.accent} />
              )}
            </View>
            <View>
              <Text style={styles.greeting}>Xin chào 👋</Text>
              <Text style={styles.userName}>{user?.name || user?.email?.split('@')[0] || 'Khách'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/profile/favorites' as any)}>
              <Ionicons name="heart" size={24} color={AppColors.danger} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/profile/notification-center' as any)}>
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Search & Date Panel ── */}
        <View style={styles.searchPanel}>
          <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/(tabs)/rooms')}>
            <Ionicons name="search" size={20} color={AppColors.textSecondary} />
            <Text style={styles.searchPlaceholder}>Tìm kiếm khách sạn, phòng...</Text>
          </TouchableOpacity>

          <View style={styles.dateSelectorRow}>
            <TouchableOpacity style={styles.dateBox} onPress={() => setShowPicker('checkIn')}>
              <Ionicons name="calendar-outline" size={18} color={AppColors.accent} />
              <View>
                <Text style={styles.dateLabel}>Nhận phòng</Text>
                <Text style={styles.dateValue}>{checkIn ? formatDate(checkIn) : 'Chọn ngày'}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dateDivider} />

            <TouchableOpacity style={styles.dateBox} onPress={() => setShowPicker('checkOut')}>
              <Ionicons name="calendar-outline" size={18} color={AppColors.accent} />
              <View>
                <Text style={styles.dateLabel}>Trả phòng</Text>
                <Text style={styles.dateValue}>{checkOut ? formatDate(checkOut) : 'Chọn ngày'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => {
              const params: any = {};
              if (checkIn) params.checkIn = checkIn.toISOString().split('T')[0];
              if (checkOut) params.checkOut = checkOut.toISOString().split('T')[0];
              router.push({ pathname: '/(tabs)/rooms', params });
            }}
          >
            <LinearGradient
              colors={['#FFAD33', '#FF8C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.searchBtnGradient}
            >
              <Text style={styles.searchBtnText}>TÌM KIẾM PHÒNG TRỐNG</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Date Pickers */}
      {showPicker && (
        <DateTimePicker
          value={
            showPicker === 'checkIn'
              ? checkIn || new Date()
              : checkOut || (checkIn ? new Date(checkIn.getTime() + 86400000) : new Date())
          }
          mode="date"
          display="default"
          minimumDate={
            showPicker === 'checkOut' && checkIn
              ? new Date(checkIn.getTime() + 86400000)
              : new Date()
          }
          onChange={(event, date) => {
            setShowPicker(null);
            if (date) {
              if (showPicker === 'checkIn') {
                setCheckIn(date);
                if (checkOut && date >= checkOut) {
                  setCheckOut(new Date(date.getTime() + 86400000));
                }
              } else {
                setCheckOut(date);
              }
            }
          }}
        />
      )}

      {/* ═══ BANNER CAROUSEL ═══ */}
      <View style={styles.section}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={false}
          snapToInterval={width - 40}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
        >
          {BANNERS.map((banner) => (
            <TouchableOpacity key={banner.id} activeOpacity={0.9} style={styles.bannerCard}>
              <ImageBackground
                source={banner.image}
                style={styles.bannerImage}
                imageStyle={{ borderRadius: Radius.lg }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.bannerOverlay}
                >
                  <View style={styles.bannerBadge}>
                    <Text style={styles.bannerBadgeText}>🔥 Khuyến mãi</Text>
                  </View>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ═══ CATEGORIES ═══ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loại Phòng</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => router.push('/(tabs)/rooms')}
            >
              <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                <Ionicons name={cat.icon} size={24} color={cat.color} />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ═══ FEATURED ROOMS ═══ */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Phòng Nổi Bật</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/rooms')}>
            <Text style={styles.seeAll}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: Spacing.lg, paddingRight: Spacing.sm }}
        >
          {isLoading ? (
            <Text style={{ padding: 20 }}>Đang tải phòng...</Text>
          ) : featuredRooms.map((room) => {
            const primaryImage = room.images?.find((img: any) => img.isPrimary)?.url || room.images?.[0]?.url || 'https://via.placeholder.com/300x200';
            const location = room.location;

            return (
              <TouchableOpacity
                key={room.id}
                style={styles.roomCard}
                activeOpacity={0.9}
                onPress={() => router.push(`/(tabs)/rooms/${room.id}`)}
              >
                <View style={styles.roomImageContainer}>
                  <Image source={{ uri: primaryImage }} style={styles.roomImage} />
                  {room.pricePerNight < 3000000 && (
                    <View style={[styles.roomBadge, { backgroundColor: AppColors.danger }]}>
                      <Text style={styles.roomBadgeText}>Hot Deal</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={[styles.heartBtn, favoriteIds.has(room.id) && styles.heartBtnActive]}
                    onPress={(e) => { e.stopPropagation(); toggleFavorite(room.id); }}
                  >
                    <Ionicons
                      name={favoriteIds.has(room.id) ? 'heart' : 'heart-outline'}
                      size={18}
                      color={favoriteIds.has(room.id) ? AppColors.danger : '#fff'}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
                  <View style={styles.roomLocationRow}>
                    <Ionicons name="location-outline" size={14} color={AppColors.textSecondary} />
                    <Text style={styles.roomLocation}>{location}</Text>
                  </View>
                  <View style={styles.roomRatingRow}>
                    <StarRating rating={Number(room.avgRating) || 5.0} />
                    <Text style={styles.roomRatingText}>{Number(room.avgRating) || 5.0}</Text>
                    <Text style={styles.roomReviews}>({room.reviewCount || 0})</Text>
                  </View>
                  <View style={styles.roomPriceRow}>
                    <Text style={styles.roomPrice}>{Number(room.pricePerNight).toLocaleString('vi-VN')}đ</Text>
                    <Text style={styles.roomPerNight}>/đêm</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ═══ SPECIAL DEALS ═══ */}
      <View style={[styles.section, { marginBottom: Spacing.huge }]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>🔥 Deal Đặc Biệt</Text>
            <Text style={styles.sectionSubtitle}>Nhanh tay kẻo hết!</Text>
          </View>
        </View>

        {DEALS.map((deal) => (
          <TouchableOpacity
            key={deal.id}
            style={styles.dealCard}
            activeOpacity={0.9}
            onPress={() => {
              if (featuredRooms.length > 0) {
                router.push(`/(tabs)/rooms/${featuredRooms[0].id}`);
              } else {
                router.push('/(tabs)/rooms');
              }
            }}
          >
            <Image source={deal.image} style={styles.dealImage} />
            <View style={styles.dealInfo}>
              <View style={styles.dealDiscountBadge}>
                <Text style={styles.dealDiscountText}>{deal.discount}</Text>
              </View>
              <Text style={styles.dealName} numberOfLines={2}>{deal.name}</Text>
              <Text style={styles.dealOriginalPrice}>{deal.originalPrice}đ</Text>
              <Text style={styles.dealSalePrice}>{deal.salePrice}đ/đêm</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  // ─── Header ───
  header: {
    paddingTop: 50,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AppColors.accent,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: AppColors.danger,
    borderWidth: 1.5,
    borderColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    height: 48,
    gap: Spacing.md,
  },
  searchPlaceholder: {
    flex: 1,
    color: AppColors.textLight,
    fontSize: 14,
  },
  searchFilter: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ── Search Panel ──
  searchPanel: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    ...Shadows.medium,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: AppColors.borderLight,
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  dateDivider: {
    width: 1,
    height: 30,
    backgroundColor: AppColors.borderLight,
    marginHorizontal: Spacing.md,
  },
  dateLabel: {
    fontSize: 12,
    color: AppColors.textLight,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
  },
  searchBtn: {
    marginTop: Spacing.lg,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  searchBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
  // ─── Sections ───
  section: {
    marginTop: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: AppColors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    paddingHorizontal: Spacing.lg,
  },
  seeAll: {
    fontSize: 14,
    color: AppColors.accent,
    fontWeight: '600',
  },
  // ─── Banner ───
  bannerCard: {
    width: width - 48,
    marginRight: Spacing.md,
    borderRadius: Radius.lg,
  },
  bannerImage: {
    width: '100%',
    height: 180,
    justifyContent: 'flex-end',
  },
  bannerOverlay: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    paddingTop: Spacing.huge,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.round,
    marginBottom: Spacing.sm,
  },
  bannerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  // ─── Categories ───
  categoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
  },
  categoryCard: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  // ─── Room Cards ───
  roomCard: {
    width: CARD_WIDTH,
    marginRight: Spacing.md,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    ...Shadows.medium,
    overflow: 'hidden',
  },
  roomImageContainer: {
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  roomBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  roomBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  heartBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartBtnActive: {
    backgroundColor: '#fff',
  },
  roomInfo: {
    padding: Spacing.md,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  roomLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  roomLocation: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  roomRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  roomRatingText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  roomReviews: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  roomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  roomPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.accent,
  },
  roomPerNight: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginLeft: 2,
  },
  // ─── Deals ───
  dealCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.medium,
    overflow: 'hidden',
  },
  dealImage: {
    width: 120,
    height: 120,
  },
  dealInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  dealDiscountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.dangerLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    marginBottom: Spacing.xs,
  },
  dealDiscountText: {
    color: AppColors.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },
  dealName: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  dealOriginalPrice: {
    fontSize: 13,
    color: AppColors.textLight,
    textDecorationLine: 'line-through',
  },
  dealSalePrice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: AppColors.danger,
  },
});