import { auth } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { signOut } from "firebase/auth";
import { useCallback, useEffect } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text } from "react-native";

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


    return (
        <SafeAreaView style={styles.container}>
    
          <Pressable
            onPress={async () => {
              await signOut(auth);
              await AsyncStorage.removeItem('@user');
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('displayName');
              router.navigate('/');
            }}
            style={styles.signOutButton}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </SafeAreaView>
      );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 22,
      fontWeight: '600',
      marginBottom: 30,
    },
    signOutButton: {
      backgroundColor: '#FF3B30', // iOS system red
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3, // for Android shadow
    },
    signOutText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
  