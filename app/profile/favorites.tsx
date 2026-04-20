import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { AppColors, Shadows, Radius, Spacing, Gradients } from '../../constants/theme';
import { apiClient } from '../../services/api';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Refresh khi quay lại màn hình
  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const fetchFavorites = async () => {
    try {
      if (!isRefreshing) setIsLoading(true);
      const res = await apiClient.get('/favorites');
      if (res.data?.success) {
        setFavorites(res.data.data.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRemoveFavorite = (roomId: string, roomName: string) => {
    Alert.alert(
      'Bỏ yêu thích?',
      `Bạn muốn bỏ "${roomName}" khỏi danh sách yêu thích?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Bỏ yêu thích',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemovingId(roomId);
              await apiClient.delete(`/favorites/${roomId}`);
              // Xoá khỏi state local ngay lập tức (optimistic UI)
              setFavorites(prev => prev.filter(f => f.room.id !== roomId));
            } catch (error) {
              console.error('Remove favorite error:', error);
              Alert.alert('Lỗi', 'Không thể bỏ yêu thích. Vui lòng thử lại.');
            } finally {
              setRemovingId(null);
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (n: number) => Number(n || 0).toLocaleString('vi-VN');

  if (isLoading && !isRefreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.primary as [string, string]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phòng yêu thích</Text>
        <Text style={styles.headerCount}>{favorites.length}</Text>
      </LinearGradient>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => { setIsRefreshing(true); fetchFavorites(); }}
            colors={[AppColors.primary]}
          />
        }
        renderItem={({ item }) => {
          const room = item.room;
          const roomImage = room?.images?.[0]?.url
            ? { uri: room.images[0].url }
            : require('../../assets/images/room1.jpg');
          const isRemoving = removingId === room.id;

          return (
            <TouchableOpacity
              style={[styles.card, isRemoving && { opacity: 0.5 }]}
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: '/(tabs)/rooms/[id]', params: { id: room.id } })}
            >
              <Image source={roomImage} style={styles.cardImage} />

              {/* Nút bỏ yêu thích */}
              <TouchableOpacity
                style={styles.heartBtn}
                onPress={() => handleRemoveFavorite(room.id, room.name)}
                disabled={isRemoving}
              >
                {isRemoving ? (
                  <ActivityIndicator size="small" color={AppColors.danger} />
                ) : (
                  <Ionicons name="heart" size={20} color={AppColors.danger} />
                )}
              </TouchableOpacity>

              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={1}>{room.name}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={AppColors.textSecondary} />
                  <Text style={styles.locationText}>{room.location}</Text>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={AppColors.star} />
                    <Text style={styles.ratingText}>{room.avgRating || '0'}</Text>
                    <Text style={styles.reviewCount}>({room.reviewCount})</Text>
                  </View>
                  <Text style={styles.price}>
                    {formatCurrency(Number(room.pricePerNight))}đ
                    <Text style={styles.priceUnit}>/đêm</Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={56} color={AppColors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có phòng yêu thích</Text>
            <Text style={styles.emptyDesc}>
              Nhấn biểu tượng ♥ trên trang chi tiết phòng để thêm vào danh sách yêu thích
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.exploreBtnText}>Khám phá phòng</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  headerCount: {
    fontSize: 14, fontWeight: '600', color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
    overflow: 'hidden', minWidth: 30, textAlign: 'center',
  },
  listContent: { padding: Spacing.lg, paddingBottom: Spacing.huge },
  card: {
    backgroundColor: '#fff', borderRadius: Radius.lg,
    marginBottom: Spacing.lg, overflow: 'hidden', ...Shadows.medium,
  },
  cardImage: { width: '100%', height: 180 },
  heartBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    ...Shadows.small,
  },
  cardBody: { padding: Spacing.lg },
  cardName: { fontSize: 16, fontWeight: '700', color: AppColors.textPrimary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  locationText: { fontSize: 13, color: AppColors.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: AppColors.textPrimary },
  reviewCount: { fontSize: 12, color: AppColors.textSecondary },
  price: { fontSize: 17, fontWeight: 'bold', color: AppColors.accent },
  priceUnit: { fontSize: 12, fontWeight: '400', color: AppColors.textSecondary },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.huge * 2 },
  emptyIcon: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: AppColors.borderLight,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: AppColors.textPrimary, marginTop: Spacing.xl },
  emptyDesc: {
    fontSize: 14, color: AppColors.textSecondary, marginTop: Spacing.sm,
    textAlign: 'center', paddingHorizontal: Spacing.xxl, lineHeight: 20,
  },
  exploreBtn: {
    marginTop: Spacing.xl, backgroundColor: AppColors.primary,
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  exploreBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
