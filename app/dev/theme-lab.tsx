import { Text, View } from 'react-native';

import { Body, Card, PrimaryButton, Screen, SectionTitle } from '@/src/ui/components';
import { colors } from '@/src/ui/theme';

export default function ThemeLab() {
  return <Screen><Card><SectionTitle>Light preview</SectionTitle><Body>Global palette driven by Life Compass tokens.</Body>{Object.entries(colors).map(([name, value]) => <View key={name} style={{ backgroundColor: value, borderRadius: 10, padding: 10, marginTop: 7 }}><Text style={{ color: name.includes('Soft') || name === 'surface' || name === 'background' ? colors.ink : '#fff', fontWeight: '800' }}>{name} · {value}</Text></View>)}</Card><Card><SectionTitle>Buttons and reduced motion</SectionTitle><PrimaryButton label="Primary" onPress={() => undefined} /><PrimaryButton label="Study" tone="study" onPress={() => undefined} /><PrimaryButton label="Quiet" tone="quiet" onPress={() => undefined} /></Card></Screen>;
}
