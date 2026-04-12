import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, Dimensions, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Typography, Gradients } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const FILTERS = [
  { id: 'all', label: 'Tất cả', icon: 'grid-outline' as const },
  { id: 'single', label: 'Phòng Đơn', icon: 'person-outline' as const },
  { id: 'double', label: 'Phòng Đôi', icon: 'people-outline' as const },
  { id: 'suite', label: 'Suite', icon: 'star-outline' as const },
  { id: 'vip', label: 'VIP', icon: 'diamond-outline' as const },
];

const ALL_ROOMS = [
  {
    id: '1', name: 'Phòng Deluxe Ocean View', type: 'double',
    price: '2.500.000', image: require('../../../assets/images/room1.jpg'),
    rating: 4.8, reviews: 124, location: 'Đà Nẵng', badge: 'Hot Deal',
    amenities: ['wifi', 'tv', 'snow-outline'],
  },
  {
    id: '2', name: 'Suite Tổng Thống', type: 'suite',
    price: '8.000.000', image: require('../../../assets/images/room2.jpg'),
    rating: 4.9, reviews: 89, location: 'Hà Nội', badge: 'Premium',
    amenities: ['wifi', 'tv', 'wine', 'snow-outline'],
  },
  {
    id: '3', name: 'Phòng Superior Garden', type: 'double',
    price: '1.800.000', image: require('../../../assets/images/room3.jpg'),
    rating: 4.6, reviews: 256, location: 'Hồ Chí Minh', badge: null,
    amenities: ['wifi', 'tv'],
  },
  {
    id: '4', name: 'Phòng Standard City View', type: 'single',
    price: '900.000', image: require('../../../assets/images/nn1.jpg'),
    rating: 4.3, reviews: 412, location: 'Đà Lạt', badge: 'Giá tốt',
    amenities: ['wifi'],
  },
  {
    id: '5', name: 'Royal Penthouse Suite', type: 'vip',
    price: '15.000.000', image: require('../../../assets/images/nn2.jpg'),
    rating: 5.0, reviews: 32, location: 'Phú Quốc', badge: 'Exclusive',
    amenities: ['wifi', 'tv', 'wine', 'snow-outline', 'fitness-outline'],
  },
  {
    id: '6', name: 'Phòng Family Deluxe', type: 'double',
    price: '3.200.000', image: require('../../../assets/images/nn3.jpg'),
    rating: 4.7, reviews: 178, location: 'Nha Trang', badge: null,
    amenities: ['wifi', 'tv', 'snow-outline'],
  },
];

const StarRating = ({ rating, size = 12 }: { rating: number; size?: number }) => (
  <View style={{ flexDirection: 'row', gap: 1 }}>
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

export default function RoomList() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = ALL_ROOMS.filter((room) => {
    const matchFilter = activeFilter === 'all' || room.type === activeFilter;
    const matchSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Hot Deal': return AppColors.danger;
      case 'Premium': return AppColors.accent;
      case 'Exclusive': return '#8B5CF6';
      case 'Giá tốt': return AppColors.success;
      default: return AppColors.secondary;
    }
  };

  const renderRoom = ({ item }: { item: typeof ALL_ROOMS[0] }) => (
    <TouchableOpacity
      style={styles.roomCard}
      activeOpacity={0.9}
      onPress={() => router.push(`/(tabs)/rooms/${item.id}`)}
    >
      <View style={styles.roomImageContainer}>
        <Image source={item.image} style={styles.roomImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={styles.roomImageOverlay}
        />
        {item.badge && (
          <View style={[styles.roomBadge, { backgroundColor: getBadgeColor(item.badge) }]}>
            <Text style={styles.roomBadgeText}>{item.badge}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.heartBtn}>
          <Ionicons name="heart-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.priceOverlay}>
          <Text style={styles.priceOverlayText}>{item.price}đ</Text>
          <Text style={styles.pricePerNight}>/đêm</Text>
        </View>
      </View>
      <View style={styles.roomInfo}>
        <Text style={styles.roomName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={AppColors.textSecondary} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.ratingRow}>
            <StarRating rating={item.rating} />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews} đánh giá)</Text>
          </View>
          <View style={styles.amenitiesRow}>
            {item.amenities.slice(0, 3).map((icon, idx) => (
              <Ionicons key={idx} name={icon as any} size={14} color={AppColors.textLight} />
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <Text style={styles.headerTitle}>Tìm Phòng</Text>
        <Text style={styles.headerSubtitle}>{ALL_ROOMS.length} phòng đang chờ bạn</Text>
        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={AppColors.textSecondary} />
          <TextInput
            placeholder="Tìm theo tên, địa điểm..."
            placeholderTextColor={AppColors.textLight}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={AppColors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filters */}
      <FlatList
        data={FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === item.id && styles.filterChipActive]}
            onPress={() => setActiveFilter(item.id)}
          >
            <Ionicons
              name={item.icon}
              size={16}
              color={activeFilter === item.id ? '#fff' : AppColors.textSecondary}
            />
            <Text style={[styles.filterText, activeFilter === item.id && styles.filterTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Room List */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoom}
        contentContainerStyle={styles.roomList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={AppColors.textLight} />
            <Text style={styles.emptyText}>Không tìm thấy phòng nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    height: 46,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: AppColors.textPrimary,
  },
  filterList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.round,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: AppColors.border,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  filterText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  roomList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  roomCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
    overflow: 'hidden',
  },
  roomImageContainer: {
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: 200,
  },
  roomImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
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
    letterSpacing: 0.5,
  },
  heartBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceOverlay: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  priceOverlayText: {
    color: AppColors.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  pricePerNight: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginLeft: 2,
  },
  roomInfo: {
    padding: Spacing.lg,
  },
  roomName: {
    fontSize: 17,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  locationText: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  reviewsText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    marginTop: Spacing.md,
  },
});
