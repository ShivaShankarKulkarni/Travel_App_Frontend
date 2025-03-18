import { Stack } from "expo-router";
import { useLocalSearchParams } from "expo-router";

export default function DashboardLayout() {
    const { displayName } = useLocalSearchParams();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: `Dashboard` }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} initialParams={{ displayName }} />
    </Stack>
  );
}