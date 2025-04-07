import { Redirect, router, useFocusEffect } from "expo-router";
import { ActivityIndicator, Image, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from 'expo-web-browser';
import {GoogleAuthProvider, onAuthStateChanged, signInWithCredential} from "firebase/auth";
import {auth} from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BACKEND_URL } from "@/config";


WebBrowser.maybeCompleteAuthSession();

interface UserInfo {
  email?: string; // Optional because it might not always be available
  displayName?: string;  // Add other properties if needed
  photoURL?: string;
}

export default function Index() {
  const [userinfo, setUserInfo] = useState<UserInfo>({});
  const [loading, setLoading] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '415962959198-a81325pd5t5t05d96kkpl1upokc7n542.apps.googleusercontent.com',
    androidClientId: '415962959198-tcojc993ho9rifab2n0ic4fijduvmdc0.apps.googleusercontent.com'
  });


  useFocusEffect(
    useCallback(() => {
        const checkUser = async () => {
            try {
                // await AsyncStorage.removeItem("@user");
                // await AsyncStorage.removeItem("token");
                // await signOut(auth);
                const userJson = await AsyncStorage.getItem("@user");
                const userData = userJson ? JSON.parse(userJson) : null;
                const displayName = await AsyncStorage.getItem("displayName");
                if (auth != null && displayName != null) {
                    // Redirect to dashboard
                    setLoading(false);
                    router.push({
                        pathname: "/dashboard/[displayName]",
                        params: { displayName: encodeURIComponent(displayName) }
                    });
                    // setLoading(true);
                    // await sendRequest();
                }
            } catch (e: any) {
                alert(e.message);
            }
        };
        checkUser();
    }, [])
  );

  const checkLocalUser = async ()=>{
        try{
          const userJson = await AsyncStorage.getItem("@user");
          const userData = userJson ? JSON.parse(userJson) : null;
          if(userData != null){
            setUserInfo(userData);
            setLoading(true);
            await sendRequest();
          }
        }catch(e: any){
          alert(e.message);
        }
      }

      
  // useEffect(()=>{
  //   const checkLocalUser = async ()=>{
  //     try{
  //       const userJson = await AsyncStorage.getItem("@user");
  //       const userData = userJson ? JSON.parse(userJson) : null;
  //       if(userData != null){
  //         setUserInfo(userData);
  //         setLoading(true);
  //         console.log("UserData from index = ",userData);
  //         await sendRequest();
  //       }
  //     }catch(e: any){
  //       alert(e.message);
  //     }
  //   }
  //   checkLocalUser();
  // },[]);

//   useFocusEffect(
//     useCallback(() => {
//       const checkLocalUser = async ()=>{
//         try{
//           const userJson = await AsyncStorage.getItem("@user");
//           const userData = userJson ? JSON.parse(userJson) : null;
//           if(userData != null){
//             setUserInfo(userData);
//             setLoading(true);
//             console.log("UserData from index = ",userData);
//             await sendRequest();
//           }
//         }catch(e: any){
//           alert(e.message);
//         }
//       }
//       checkLocalUser();
//     }, [])
// );


  async function sendRequest(){
    console.log("Inside sendRequest function")
    const response = await axios.post(`${BACKEND_URL}/v1/user/googlesignin`, userinfo);
    const jwt = response.data.token;
    const displayName = response.data.newUser.fullName
    if(Platform.OS === "web"){
        localStorage.setItem("token", jwt);
    }
    else{
        await AsyncStorage.setItem("token", jwt);
        await AsyncStorage.setItem("displayName", displayName);
    }
    setLoading(false);
    router.push({
        pathname: "/dashboard/[displayName]",
        params: { displayName: encodeURIComponent(displayName) },
    });
  }

  useEffect(()=>{
    
    if(response?.type === "success"){
      setLoading(true);
      const {id_token} = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
    }
  },[response]);

  useEffect(()=>{
    checkLocalUser();
    const unsub = onAuthStateChanged(auth, async (user) => {
      console.log("Auth ==", auth);
      console.log("User ==", user);
        if(user){
          setUserInfo({
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || ""
          })
          await AsyncStorage.setItem("@user", JSON.stringify(user));
          // Sending backend call to /googlesignin
          await sendRequest();
        }
        else{
          setLoading(false);
        }
    });
    return ()=>unsub()
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {!loading ? (
        <Pressable onPress={()=>promptAsync()} style={styles.googleButton}>
          <Image
            source={require('../assets/images/Google-Logo.png')} // Place the logo in assets folder
            style={styles.googleLogo}
          />
          <Text style={styles.googleText}>Sign up with Google</Text>
        </Pressable>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    elevation: 2, // Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
