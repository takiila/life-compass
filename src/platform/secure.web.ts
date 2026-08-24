export async function verifySecureStorage() {
  return { available: false, message: 'WebにはKeychain / Keystore相当がないため、端末内DBとブラウザ保護を使用します。' };
}
