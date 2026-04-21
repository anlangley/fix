import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, Dimensions, TextInput, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../../constants/theme';
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

const formatDate = (date: Date) =>
  date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function RoomList() {
  const router = useRouter();
  const params = useLocalSearchParams<{ checkIn?: string; checkOut?: string }>();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Date Picker State ──────────────
  const [checkIn, setCheckIn] = useState<Date | null>(
    params.checkIn ? new Date(params.checkIn) : null
  );
  const [checkOut, setCheckOut] = useState<Date | null>(
    params.checkOut ? new Date(params.checkOut) : null
  );
  const [showPicker, setShowPicker] = useState<'checkIn' | 'checkOut' | null>(null);

  useEffect(() => {
    fetchRooms();
  }, [activeFilter, checkIn, checkOut]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const queryParams: any = {};
      if (activeFilter !== 'all') queryParams.type = activeFilter;
      if (checkIn) queryParams.checkIn = checkIn.toISOString().split('T')[0];
      if (checkOut) queryParams.checkOut = checkOut.toISOString().split('T')[0];

      const response = await apiClient.get('/rooms', { params: queryParams });
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
    const matchSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // Xử lý khi người dùng chọn ngày
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(null);
      return;
    }
    if (!selectedDate) return;

    if (showPicker === 'checkIn') {
      setCheckIn(selectedDate);
      // Nếu checkout đã có và trước ngày mới chọn -> reset checkout
      if (checkOut && selectedDate >= checkOut) {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOut(nextDay);
      }
    } else if (showPicker === 'checkOut') {
      setCheckOut(selectedDate);
    }
    setShowPicker(null);
  };

  const clearDates = () => {
    setCheckIn(null);
    setCheckOut(null);
  };

  const renderRoom = ({ item }: { item: any }) => {
    const primaryImage =
      item.images?.find((img: any) => img.isPrimary)?.url ||
      item.images?.[0]?.url ||
      'https://via.placeholder.com/300x200';
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
          {Number(item.pricePerNight) < 2000000 && (
            <View style={[styles.roomBadge, { backgroundColor: AppColors.danger }]}>
              <Text style={styles.roomBadgeText}>Hot Deal</Text>
            </View>
          )}
          <View style={styles.priceOverlay}>
            <Text style={styles.priceOverlayText}>
              {Number(item.pricePerNight).toLocaleString('vi-VN')}đ
            </Text>
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
              <StarRating rating={Number(item.avgRating) || 0} />
              <Text style={styles.ratingText}>{Number(item.avgRating) || 0}</Text>
              <Text style={styles.reviewsText}>({item.reviewCount || 0} đánh giá)</Text>
            </View>
            <View style={styles.amenitiesRow}>
              {Array.isArray(amenities) &&
                amenities.slice(0, 3).map((amenity: any, idx: number) => (
                  <Ionicons key={idx} name={amenity.icon || 'help-outline'} size={14} color={AppColors.textLight} />
                ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Ghép header + filter thành ListHeaderComponent để FlatList cuộn mượt
  const ListHeader = () => (
    <>
      {/* ── Date Picker Bar ── */}
      <View style={styles.dateBar}>
        <TouchableOpacity
          style={[styles.dateChip, checkIn && styles.dateChipActive]}
          onPress={() => setShowPicker('checkIn')}
        >
          <Ionicons name="calendar-outline" size={15} color={checkIn ? AppColors.primary : AppColors.textSecondary} />
          <Text style={[styles.dateChipText, checkIn && styles.dateChipTextActive]}>
            {checkIn ? formatDate(checkIn) : 'Check-in'}
          </Text>
        </TouchableOpacity>

        <Ionicons name="arrow-forward" size={16} color={AppColors.textLight} style={{ marginHorizontal: 4 }} />

        <TouchableOpacity
          style={[styles.dateChip, checkOut && styles.dateChipActive]}
          onPress={() => setShowPicker('checkOut')}
        >
          <Ionicons name="calendar-outline" size={15} color={checkOut ? AppColors.primary : AppColors.textSecondary} />
          <Text style={[styles.dateChipText, checkOut && styles.dateChipTextActive]}>
            {checkOut ? formatDate(checkOut) : 'Check-out'}
          </Text>
        </TouchableOpacity>

        {(checkIn || checkOut) && (
          <TouchableOpacity style={styles.clearDatesBtn} onPress={clearDates}>
            <Ionicons name="close-circle" size={20} color={AppColors.danger} />
          </TouchableOpacity>
        )}
      </View>

      {/* Thông báo lọc theo ngày */}
      {checkIn && checkOut && (
        <View style={styles.filterBanner}>
          <Ionicons name="checkmark-circle" size={16} color={AppColors.success} />
          <Text style={styles.filterBannerText}>
            Hiển thị {filteredRooms.length} phòng trống từ {formatDate(checkIn)} → {formatDate(checkOut)}
          </Text>
        </View>
      )}

      {/* ── Filter Chips ── */}
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
    </>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <Text style={styles.headerTitle}>Tìm Phòng</Text>
        <Text style={styles.headerSubtitle}>{filteredRooms.length} phòng đang chờ bạn</Text>
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

      {/* Room List với ListHeader */}
      <FlatList
        data={isLoading ? [] : filteredRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoom}
        ListHeaderComponent={<ListHeader />}
        contentContainerStyle={styles.roomList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons
                name={checkIn && checkOut ? 'bed-outline' : 'search-outline'}
                size={56}
                color={AppColors.textLight}
              />
              <Text style={styles.emptyText}>
                {checkIn && checkOut
                  ? 'Không có phòng trống trong khoảng thời gian này'
                  : 'Không tìm thấy phòng nào'}
              </Text>
              {checkIn && checkOut && (
                <TouchableOpacity style={styles.emptyAction} onPress={clearDates}>
                  <Text style={styles.emptyActionText}>Xóa bộ lọc ngày</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Đang tải...</Text>
            </View>
          )
        }
      />

      {/* ── Native Date Picker ── */}
      {showPicker && (
        <DateTimePicker
          value={
            showPicker === 'checkIn'
              ? checkIn ?? new Date()
              : checkOut ?? (checkIn ? new Date(checkIn.getTime() + 86400000) : new Date())
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={
            showPicker === 'checkOut' && checkIn
              ? new Date(checkIn.getTime() + 86400000) // checkOut tối thiểu là ngày sau checkIn
              : new Date() // checkIn tối thiểu là hôm nay
          }
          onChange={onDateChange}
        />
      )}
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
  // ── Date Bar ──
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    backgroundColor: AppColors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  dateChipActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + '10',
  },
  dateChipText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  dateChipTextActive: {
    color: AppColors.primary,
    fontWeight: '600',
  },
  clearDatesBtn: {
    marginLeft: Spacing.sm,
    padding: 4,
  },
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: AppColors.success + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  filterBannerText: {
    fontSize: 12,
    color: AppColors.success,
    fontWeight: '500',
    flex: 1,
  },
  // ── Filter chips ──
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
  // ── Room cards ──
  roomList: {
    paddingBottom: Spacing.huge,
  },
  roomCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.lg,
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
  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.huge,
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: AppColors.primary,
    borderRadius: Radius.md,
  },
  emptyActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
