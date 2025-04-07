import { Stack, Tabs, useLocalSearchParams } from "expo-router";

export default function dashboardLayout() {
  const { displayName } = useLocalSearchParams();
    return (
        <Tabs>
          <Tabs.Screen name="index" options={{ title: "Dashboard" }} initialParams={{ displayName }} />
          <Tabs.Screen name="CreateJourney" options={{ title: "Create Journey" }} initialParams={{ displayName }} />
          <Tabs.Screen name="Settings" options={{ title: "Settings" }} initialParams={{ displayName }} />
        </Tabs>
      );
}