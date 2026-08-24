import { Tabs } from 'expo-router';
import { ColorValue, Text } from 'react-native';

import { colors } from '@/src/ui/theme';

const Icon = ({ children, color }: { children: string; color: ColorValue }) => <Text style={{ color, fontSize: 18 }}>{children}</Text>;

export default function TabLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarStyle: { height: 66, paddingTop: 6, paddingBottom: 8, backgroundColor: colors.surface, borderTopColor: colors.border }, tabBarLabelStyle: { fontWeight: '800', fontSize: 10 } }}>
    <Tabs.Screen name="index" options={{ title: '今日', tabBarIcon: ({ color }) => <Icon color={color}>⌖</Icon> }} />
    <Tabs.Screen name="study" options={{ title: 'Study', tabBarIcon: ({ color }) => <Icon color={color}>▤</Icon> }} />
    <Tabs.Screen name="training" options={{ title: 'Training', tabBarIcon: ({ color }) => <Icon color={color}>◒</Icon> }} />
    <Tabs.Screen name="journey" options={{ title: 'Journey', tabBarIcon: ({ color }) => <Icon color={color}>✦</Icon> }} />
    <Tabs.Screen name="settings" options={{ title: '設定', tabBarIcon: ({ color }) => <Icon color={color}>⚙</Icon> }} />
  </Tabs>;
}
