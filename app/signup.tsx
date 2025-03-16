import { Auth } from "@/components/Auth";
import { ScrollView, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Signup(){
    return (
       <SafeAreaProvider>
                <Auth type="signup"></Auth>
        </SafeAreaProvider>
    )
}