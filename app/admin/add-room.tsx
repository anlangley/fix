import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Shadows, Radius, Spacing } from '../../constants/theme';
import { apiClient } from '../../services/api';

const ROOM_TYPES = [
  { label: 'Phòng Đơn', value: 'SINGLE' },
  { label: 'Phòng Đôi', value: 'DOUBLE' },
  { label: 'Phòng Suite', value: 'SUITE' },
  { label: 'Phòng VIP', value: 'VIP' },
];

export default function AddRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const roomId = params.id as string;
  const isEditing = !!roomId;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  const [form, setForm] = useState({
    name: '',
    type: 'SINGLE' as 'SINGLE' | 'DOUBLE' | 'SUITE' | 'VIP',
    pricePerNight: '',
    location: 'Đà Nẵng',
    description: '',
    capacityAdults: 2,
    capacityChildren: 1,
  });

  const [images, setImages] = useState<{ uri: string; isPrimary: boolean; id?: string }[]>([]);

  useEffect(() => {
    if (isEditing) {
      fetchRoomDetails();
    }
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      const response = await apiClient.get(`/rooms/${roomId}`);
      if (response.data?.success) {
        const room = response.data.data.room;
        setForm({
          name: room.name,
          type: room.type,
          pricePerNight: room.pricePerNight.toString(),
          location: room.location,
          description: room.description || '',
          capacityAdults: room.capacityAdults,
          capacityChildren: room.capacityChildren,
        });
        
        if (room.images && room.images.length > 0) {
          setImages(room.images.map((img: any) => ({
            uri: img.url,
            isPrimary: img.isPrimary,
            id: img.id
          })));
        }
      }
    } catch (error) {
      console.error('Fetch room details failed:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin phòng.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset, idx) => ({
        uri: asset.uri,
        isPrimary: images.length === 0 && idx === 0, // Tự động chọn tấm đầu làm primary nếu chưa có
      }));
      setImages([...images, ...newImages]);
    }
  };

  const togglePrimary = (index: number) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: i === index
    })));
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Nếu xóa đúng tấm Primary, chọn lại tấm đầu tiên
      if (prev[index].isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    // Validate cơ bản
    if (!form.name || !form.pricePerNight || !form.description) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    try {
      setIsSubmitting(true);

      let finalImageUrls: string[] = [];

      // Phân tách ảnh cũ và ảnh mới
      const existingImages = images.filter(img => img.uri.startsWith('http'));
      const newImages = images.filter(img => !img.uri.startsWith('http'));

      const uploadedUrls: string[] = [];

      // 1. Upload ảnh mới nếu có
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((img) => {
          const filename = img.uri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename || '');
          const type = match ? `image/${match[1]}` : `image`;
          // @ts-ignore
          formData.append('images', { uri: img.uri, name: filename, type });
        });

        const uploadRes = await apiClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadRes.data?.success) {
          uploadedUrls.push(...uploadRes.data.data.imageUrls);
        }
      }

      // Gộp ảnh đã có trên server và ảnh vừa upload
      // Sắp xếp lại dựa vào thẻ Primary đang nằm ở vị trí nào trong danh sách chung (images)
      const allUrlsTemp = [...existingImages.map(img => img.uri), ...uploadedUrls];
      
      const primaryIndex = images.findIndex(img => img.isPrimary);
      if (allUrlsTemp.length > 0 && primaryIndex !== -1) {
          const primaryUrl = allUrlsTemp[primaryIndex];
          finalImageUrls = [primaryUrl, ...allUrlsTemp.filter((_, i) => i !== primaryIndex)];
      } else {
          finalImageUrls = allUrlsTemp;
      }

      const payload = {
        ...form,
        pricePerNight: Number(form.pricePerNight),
        amenities: [
          { icon: 'wifi', label: 'Wifi miễn phí' },
          { icon: 'snow', label: 'Điều hòa' }
        ],
        imageUrls: finalImageUrls.length > 0 ? finalImageUrls : undefined
      };

      let response;
      if (isEditing) {
        response = await apiClient.put(`/rooms/${roomId}`, payload);
      } else {
        response = await apiClient.post('/rooms', payload);
      }

      if (response.data?.success) {
        Alert.alert('Thành công', isEditing ? 'Đã cập nhật phòng thành công!' : 'Đã thêm phòng mới thành công!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      console.error(isEditing ? 'Update room failed:' : 'Add room failed:', error);
      const serverError = error.response?.data;
      let errorMsg = isEditing ? 'Không thể cập nhật phòng.' : 'Không thể thêm phòng mới.';
      
      if (serverError) {
        if (serverError.message) errorMsg = serverError.message;
        if (serverError.errors && serverError.errors.length > 0) {
          const detailedErrors = serverError.errors.map((e: any) => e.message).join('\n- ');
          errorMsg += `\n- ${detailedErrors}`;
        }
      }
      
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: AppColors.background }}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Chỉnh Sửa Phòng' : 'Thêm Phòng Mới'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Tên phòng *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Deluxe Ocean View"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Loại phòng</Text>
          <View style={styles.typeRow}>
            {ROOM_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeBtn, form.type === t.value && styles.typeBtnActive]}
                onPress={() => setForm({ ...form, type: t.value as any })}
              >
                <Text style={[styles.typeText, form.type === t.value && styles.typeTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>Giá/đêm (VNĐ) *</Text>
            <TextInput
              style={styles.input}
              placeholder="2500000"
              keyboardType="numeric"
              value={form.pricePerNight}
              onChangeText={(text) => setForm({ ...form, pricePerNight: text })}
            />
          </View>
          <View style={[styles.section, { flex: 1, marginLeft: Spacing.md }]}>
            <Text style={styles.label}>Địa điểm</Text>
            <TextInput
              style={styles.input}
              placeholder="Đà Nẵng"
              value={form.location}
              onChangeText={(text) => setForm({ ...form, location: text })}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>Người lớn</Text>
            <View style={styles.counter}>
              <TouchableOpacity onPress={() => setForm({ ...form, capacityAdults: Math.max(1, form.capacityAdults - 1) })}>
                <Ionicons name="remove-circle-outline" size={28} color={AppColors.primary} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{form.capacityAdults}</Text>
              <TouchableOpacity onPress={() => setForm({ ...form, capacityAdults: form.capacityAdults + 1 })}>
                <Ionicons name="add-circle-outline" size={28} color={AppColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.section, { flex: 1, marginLeft: Spacing.md }]}>
            <Text style={styles.label}>Trẻ em</Text>
            <View style={styles.counter}>
              <TouchableOpacity onPress={() => setForm({ ...form, capacityChildren: Math.max(0, form.capacityChildren - 1) })}>
                <Ionicons name="remove-circle-outline" size={28} color={AppColors.primary} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{form.capacityChildren}</Text>
              <TouchableOpacity onPress={() => setForm({ ...form, capacityChildren: form.capacityChildren + 1 })}>
                <Ionicons name="add-circle-outline" size={28} color={AppColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Hình ảnh phòng (Tối đa 10 ảnh)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {images.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: img.uri }} style={styles.imageItem} />
                <TouchableOpacity style={styles.removeIcon} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={22} color={AppColors.danger} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.primaryBadge, img.isPrimary && styles.primaryBadgeActive]} 
                  onPress={() => togglePrimary(index)}
                >
                  <Text style={[styles.primaryBadgeText, img.isPrimary && styles.primaryBadgeTextActive]}>
                    {img.isPrimary ? 'Ảnh chính' : 'Làm ảnh chính'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
              <Ionicons name="camera-outline" size={30} color={AppColors.textLight} />
              <Text style={styles.addImageText}>Thêm ảnh</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Mô tả phòng *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập mô tả chi tiết về phòng..."
            multiline
            numberOfLines={4}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{isEditing ? 'Cập Nhật Phòng' : 'Tạo Phòng Mới'}</Text>
          )}
        </TouchableOpacity>
        
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  header: {
    paddingTop: 50, paddingBottom: Spacing.md, paddingHorizontal: Spacing.lg,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: AppColors.borderLight,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: AppColors.textPrimary },
  content: { flex: 1, padding: Spacing.lg },
  section: { marginBottom: Spacing.xl },
  label: { fontSize: 14, fontWeight: '600', color: AppColors.textPrimary, marginBottom: Spacing.sm },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: AppColors.borderLight,
    fontSize: 15, color: AppColors.textPrimary,
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  imageScroll: { marginBottom: Spacing.md },
  imageWrapper: { marginRight: Spacing.md, position: 'relative' },
  imageItem: { width: 120, height: 120, borderRadius: Radius.md },
  removeIcon: { position: 'absolute', top: -5, right: -5, zIndex: 10, backgroundColor: '#fff', borderRadius: 11 },
  primaryBadge: {
    position: 'absolute', bottom: 5, left: 5, right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: Radius.xs,
    paddingVertical: 2, alignItems: 'center',
  },
  primaryBadgeActive: { backgroundColor: AppColors.primary },
  primaryBadgeText: { fontSize: 9, color: '#fff', fontWeight: '600' },
  primaryBadgeTextActive: { fontWeight: 'bold' },
  addImageBtn: {
    width: 120, height: 120, borderRadius: Radius.md,
    borderWidth: 2, borderColor: AppColors.borderLight, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC',
  },
  addImageText: { fontSize: 12, color: AppColors.textLight, marginTop: 4 },
  row: { flexDirection: 'row' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.round, backgroundColor: '#F1F5F9',
    borderWidth: 1, borderColor: 'transparent',
  },
  typeBtnActive: {
    backgroundColor: AppColors.primary + '15',
    borderColor: AppColors.primary,
  },
  typeText: { fontSize: 13, color: AppColors.textSecondary },
  typeTextActive: { color: AppColors.primary, fontWeight: '600' },
  counter: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: Radius.md,
    padding: 8, borderWidth: 1, borderColor: AppColors.borderLight,
    justifyContent: 'space-between',
  },
  counterValue: { fontSize: 16, fontWeight: 'bold', color: AppColors.textPrimary },
  submitBtn: {
    backgroundColor: AppColors.primary, borderRadius: Radius.md,
    padding: Spacing.lg, alignItems: 'center', marginTop: Spacing.md,
    ...Shadows.medium,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
