import { Stack } from "expo-router";
// import { FlagProvider } from "./context/FlagContext";

export default function RootLayout() {
  return (
    // <FlagProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Index" }} />
        <Stack.Screen name="signin" options={{ title: "SignIn", headerBackVisible: false }} />
        <Stack.Screen name="signup" options={{ title: "SignUp", headerBackVisible: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false, headerBackVisible: false }} />
      </Stack>
    // </FlagProvider>
  );
}