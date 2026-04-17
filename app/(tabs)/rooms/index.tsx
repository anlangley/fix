import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, Dimensions, TextInput, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Typography, Gradients } from '../../../constants/theme';
import { apiClient } from '../../../services/api';

const { width } = Dimensions.get('window');

const FILTERS = [
  { id: 'all', label: 'Tất cả', icon: 'grid-outline' as const },
  { id: 'SINGLE', label: 'Phòng Đơn', icon: 'person-outline' as const },
  { id: 'DOUBLE', label: 'Phòng Đôi', icon: 'people-outline' as const },
  { id: 'SUITE', label: 'Suite', icon: 'star-outline' as const },
  { id: 'VIP', label: 'VIP', icon: 'diamond-outline' as const },
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
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, [activeFilter]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (activeFilter !== 'all') params.type = activeFilter.toUpperCase();
      
      const response = await apiClient.get('/rooms', { params });
      if (response.data?.success) {
        setRooms(response.data.data.rooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
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

  const renderRoom = ({ item }: { item: any }) => {
    const primaryImage = item.images?.find((img: any) => img.isPrimary)?.url || item.images?.[0]?.url || 'https://via.placeholder.com/300x200';
    const amenities = item.amenities ? JSON.parse(item.amenities) : [];

    return (
      <TouchableOpacity
        style={styles.roomCard}
        activeOpacity={0.9}
        onPress={() => router.push(`/(tabs)/rooms/${item.id}`)}
      >
        <View style={styles.roomImageContainer}>
          <Image source={{ uri: primaryImage }} style={styles.roomImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={styles.roomImageOverlay}
          />
          {item.pricePerNight < 2000000 && (
            <View style={[styles.roomBadge, { backgroundColor: getBadgeColor('Hot Deal') }]}>
              <Text style={styles.roomBadgeText}>Hot Deal</Text>
            </View>
          )}
          <TouchableOpacity style={styles.heartBtn}>
            <Ionicons name="heart-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.priceOverlay}>
            <Text style={styles.priceOverlayText}>{Number(item.pricePerNight).toLocaleString('vi-VN')}đ</Text>
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
              <StarRating rating={item.avgRating || 0} />
              <Text style={styles.ratingText}>{item.avgRating || 0}</Text>
              <Text style={styles.reviewsText}>({item.reviewCount || 0} đánh giá)</Text>
            </View>
            <View style={styles.amenitiesRow}>
              {Array.isArray(amenities) && amenities.slice(0, 3).map((amenity: any, idx: number) => (
                <Ionicons key={idx} name={amenity.icon || 'help-outline'} size={14} color={AppColors.textLight} />
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <Text style={styles.headerTitle}>Tìm Phòng</Text>
        <Text style={styles.headerSubtitle}>{filteredRooms.length} phòng đang chờ bạn</Text>
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
