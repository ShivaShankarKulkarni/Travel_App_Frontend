import { BACKEND_URL } from "@/config";
// import { auth } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { signOut } from "firebase/auth";
import { useCallback, useEffect } from "react";
import { Platform, Pressable, SafeAreaView, StyleSheet, Text } from "react-native";
import auth from '@react-native-firebase/auth';

interface UserInfo {
    email?: string; // Optional because it might not always be available
    displayName?: string;  // Add other properties if needed
    photoURL?: string;
  }

export default function Settings(){
    const { displayName } = useLocalSearchParams();
    //Checks whether the userData and auth is present, before rendering the page whenever clicked.
    // useFocusEffect(
    //     useCallback(() => {
    //         const checkUser = async () => {
    //             try {
    //                 // await AsyncStorage.removeItem("@user");
    //                 // await AsyncStorage.removeItem("token");
    //                 // await signOut(auth);
    //                 const userJson = await AsyncStorage.getItem("@user");
    //                 const userData = userJson ? JSON.parse(userJson) : null;
    //                 if (userData == null || auth == null) {
    //                     // Redirect to sign in
    //                     router.navigate('/');
    //                 }
    //             } catch (e: any) {
    //                 alert(e.message);
    //             }
    //         };
    //         checkUser();
    //     }, [])
    // );

    // Getting token condtionally from Android/IOS:
    const getToken = async () => {
      return await AsyncStorage.getItem("token");
    };

    //Deleting Account:
    async function deleteAccount(){
      //Delete API request: Deleting user and user's journeys in Backend (POSTGRES)
      const token = await getToken();
      const response = await axios.delete(`${BACKEND_URL}/v1/user/deleteAccount`, {
        headers: {
          Authorization: token
      }
      });
      if (response.status !== 200) {
        alert("Failed to delete from server");
        return;
      }
      //Deleting inside Firebase Users
      const currentUser = auth().currentUser;
      if (currentUser) {
        try {
          await currentUser.delete();
        } catch (error: any) {
          if (error.code === 'auth/requires-recent-login') {
            alert("You must sign in again before deleting your account.");
            return;
          } else {
            console.error("Delete user failed:", error);
          }
        }
        await auth().signOut();
      }
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('displayName');
      router.navigate('/');
    }
    return (
        <SafeAreaView style={styles.container}>
    
          <Pressable
            onPress={async () => {
              await auth().signOut();
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('displayName');
              router.navigate('/');
            }}
            style={styles.signOutButton}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>

          <Pressable onPress={deleteAccount} style={styles.deleteAccountButton}>
            <Text style={styles.deleteAccountText}>Delete Account</Text>
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
    deleteAccountButton: {
      backgroundColor: '#FF3B30', // deeper red
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 8,
      marginTop: 20,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    deleteAccountText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    
  });
  