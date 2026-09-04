import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function saveBackupFile(text: string, filename: string) {
  const file = new File(Paths.cache, filename);
  await file.write(text);
  try {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Life Compassバックアップを保存' });
  } finally {
    try { file.delete(); } catch { /* cache cleanup must not hide the share result */ }
  }
}

export async function pickBackupFile(): Promise<string | undefined> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (result.canceled) return undefined;
  const file = new File(result.assets[0].uri);
  try {
    return await file.text();
  } finally {
    try { file.delete(); } catch { /* cache cleanup must not hide the imported contents */ }
  }
}
