import { useState } from "react";
import { Button, Platform, SafeAreaView, Text, TextInput, View } from "react-native";
import auth from '@react-native-firebase/auth';
import axios from "axios";
import { BACKEND_URL } from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function PhoneNumber(){
    const [phoneNumber, setPhoneNumber] = useState('');
    const [confirm, setConfirm] = useState<any>(null);
    const [code, setCode] = useState('');

    async function SignInWithPhoneNumber(phoneNumber: string){
        const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
        console.log(phoneNumber);
        console.log(confirmation);
        setConfirm(confirmation);
    }
    async function confirmCode() {
        try {
            console.log("1");
            await confirm.confirm(code);
            console.log("2");
            await sendRequest();
        } catch (error) {
            console.log("Invalid code.", error);
        }
    }

    async function sendRequest(){
        console.log("Start of SendRequest");
        const idToken = await auth().currentUser?.getIdToken();
        const response = await axios.post(`${BACKEND_URL}/v1/user/phonenumber`, {id_token: idToken});
        const displayName = response.data.newUser.fullName;
        await AsyncStorage.setItem("token", idToken || "");
        await AsyncStorage.setItem("displayName", displayName);
        console.log("End of SendRequest");
        router.push({
            pathname: "/dashboard/[displayName]",
            params: { displayName: encodeURIComponent(displayName) },
        });
    }


    return <SafeAreaView>
        {confirm ? (
        <View>
          <Text>Enter Verification Code:</Text>
          <TextInput
            style={{borderWidth: 1, marginBottom: 20}}
            placeholder="123456"
            value={code}
            onChangeText={setCode}
          />
          <Button title="Confirm Code" onPress={confirmCode} />
        </View>
        ): (<View>
            <Text>
                Enter PhoneNumeber:
            </Text>
            <TextInput placeholder="+919234567890" value={phoneNumber} onChange={(e)=>setPhoneNumber(e.nativeEvent.text)}></TextInput>
            <Button title="Send Code" onPress={() => SignInWithPhoneNumber(phoneNumber)} />
        </View>)}
    </SafeAreaView>
}