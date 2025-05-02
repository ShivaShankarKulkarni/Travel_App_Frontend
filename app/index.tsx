// import GoogleSignin from "@/components/GoogleSignin";
import PhoneNumber from "@/components/PhoneNumber";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from '@react-native-firebase/auth';
import { router } from "expo-router";
import { useEffect, useState } from "react";


export default function Index(){
  // const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [displayName, setDisplayName] = useState("");
  async function onAuthStateChanged(user: any) {
      setUser(user);
      const idToken = await auth().currentUser?.getIdToken();
      const displayName = await AsyncStorage.getItem("displayName");
      setDisplayName(displayName || "");
      // console.log("Firebase ID Token:", idToken);
      // if (initializing) setInitializing(false);
  }

  // useEffect(() => {
  //     const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
  //     return subscriber;
  // }, []);
  
  //if (initializing) return null;
  if(user){
    router.push({
      pathname: "/dashboard/[displayName]",
      params: { displayName: encodeURIComponent(displayName) }
    })
  }
  else{
    return <>
      <PhoneNumber></PhoneNumber>
      </>
  } 
}