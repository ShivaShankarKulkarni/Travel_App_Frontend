import { Stack, Tabs } from "expo-router";

export default function dashboardLayout() {
    return (
        <Tabs>
          <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
          <Tabs.Screen name="(tabs)/CreateJourney" options={{ title: "Create Journey" }} />
        </Tabs>
      );
}