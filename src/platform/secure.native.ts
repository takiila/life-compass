import * as SecureStore from 'expo-secure-store';

export async function verifySecureStorage() {
  const key = 'life-compass-secure-check';
  const value = `${Date.now()}`;
  await SecureStore.setItemAsync(key, value);
  const read = await SecureStore.getItemAsync(key);
  await SecureStore.deleteItemAsync(key);
  return { available: read === value, message: read === value ? 'Keychain / Keystoreの読み書きを確認しました。' : '安全領域の照合に失敗しました。' };
}
