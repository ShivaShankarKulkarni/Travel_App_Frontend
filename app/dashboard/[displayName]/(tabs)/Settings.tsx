import { auth } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { signOut } from "firebase/auth";
import { useCallback, useEffect } from "react";
import { Pressable, SafeAreaView, Text } from "react-native";

interface UserInfo {
    email?: string; // Optional because it might not always be available
    displayName?: string;  // Add other properties if needed
    photoURL?: string;
  }

export default function Settings(){
    const { displayName } = useLocalSearchParams();
    //Checks whether the userData and auth is present, before rendering the page whenever clicked.
    useFocusEffect(
        useCallback(() => {
            const checkUser = async () => {
                try {
                    // await AsyncStorage.removeItem("@user");
                    // await AsyncStorage.removeItem("token");
                    // await signOut(auth);
                    const userJson = await AsyncStorage.getItem("@user");
                    const userData = userJson ? JSON.parse(userJson) : null;
                    if (userData == null || auth == null) {
                        // Redirect to sign in
                        router.navigate('/');
                    }
                } catch (e: any) {
                    alert(e.message);
                }
            };
            checkUser();
        }, [])
    );


    return <SafeAreaView>
        <Text>
            Hi from Settings
        </Text>
        <Pressable onPress={async()=>{
            await signOut(auth);
            await AsyncStorage.removeItem("@user");
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("displayName");
            router.navigate('/');
        }}>
            <Text>Sign out</Text>
        </Pressable>
    </SafeAreaView>
}