import { Stack } from "expo-router";
import { JourneyProvider } from "./context/JourneyContext";


export default function RootLayout() {
  return (
      <JourneyProvider>
        <Stack>
        <Stack.Screen name="index" options={{ title: "Index" }} />
        <Stack.Screen name="signin" options={{ title: "SignIn", headerBackVisible: false }} />
        <Stack.Screen name="signup" options={{ title: "SignUp", headerBackVisible: false }} />
        <Stack.Screen name="dashboard/[displayName]" options={{ headerShown: false, headerBackVisible: false }} />
      </Stack>
      </JourneyProvider>
  );
}