import { Auth } from "@/components/Auth";
import { ScrollView, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Signin(){
    return (
        <SafeAreaProvider>
        
            <Auth type="signin"></Auth>
        
        </SafeAreaProvider>
    )
}