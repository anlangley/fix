import * as SecureStore from 'expo-secure-store';

/**
 * Lưu chuỗi an toàn
 */
export async function saveSecureItem(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Lỗi khi lưu ${key} vào SecureStore`, error);
  }
}

/**
 * Lấy dữ liệu an toàn
 */
export async function getSecureItem(key: string) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Lỗi khi lấy ${key} từ SecureStore`, error);
    return null;
  }
}

/**
 * Xóa dữ liệu an toàn
 */
export async function deleteSecureItem(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Lỗi xóa ${key} khỏi SecureStore`, error);
  }
}
