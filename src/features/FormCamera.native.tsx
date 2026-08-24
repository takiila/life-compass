import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Body, Card, Notice, PrimaryButton, Screen, SectionTitle } from '@/src/ui/components';

export default function FormCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [active, setActive] = useState(false);
  return <Screen><Card><SectionTitle>姿勢を自分で見返す</SectionTitle><Body>ライブ映像だけを表示し、写真・動画・音声を保存しません。自動採点や診断も行いません。</Body><Notice>痛み、めまい、胸の症状、しびれ、強い息苦しさがある時は使わず、休息と必要な相談を優先してください。</Notice>{!permission?.granted ? <PrimaryButton label="カメラの許可を確認" onPress={async () => { const result = await requestPermission(); setActive(result.granted); }} /> : <PrimaryButton label={active ? 'カメラを止める' : 'ライブ映像を表示'} onPress={() => setActive(!active)} />}</Card>{active && permission?.granted ? <View style={styles.frame}><CameraView style={StyleSheet.absoluteFill} facing="front" /></View> : null}</Screen>;
}

const styles = StyleSheet.create({ frame: { height: 460, borderRadius: 22, overflow: 'hidden', marginBottom: 24 } });
