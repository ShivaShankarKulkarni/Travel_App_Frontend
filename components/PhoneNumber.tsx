import { Button, SafeAreaView, Text, TextInput, View } from "react-native";
import { auth } from '../firebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useState } from "react";

export default function PhoneNumber(){
    const [phoneNumber, setPhoneNumber] = useState('');
    const [confirm, setConfirm] = useState<any>(null);
    const [code, setCode] = useState('');
    console.log("Confirm==>",confirm);
    
    async function SignInWithPhoneNumber(phoneNumber: string){
        const confirmation = await signInWithPhoneNumber(auth, phoneNumber);
        setConfirm(confirmation);
    }
    async function confirmCode() {
        try {
            await confirm.confirm(code);
            console.log("Code==>",code);
            console.log("Phone authentication successful 🎉");
        } catch (error) {
            console.log("Invalid code.", error);
        }
    }
    return <SafeAreaView>
        <View>
            <Text>
                Enter PhoneNumeber:
            </Text>
            <TextInput placeholder="+919234567890" value={phoneNumber} onChange={(e)=>setPhoneNumber(e.nativeEvent.text)}></TextInput>
            <Button title="Send Code" onPress={() => SignInWithPhoneNumber(phoneNumber)} />
        </View>
        {confirm && (
        <View>
          <Text>Enter Verification Code:</Text>
          <TextInput
            placeholder="123456"
            value={code}
            onChangeText={setCode}
          />
          <Button title="Confirm Code" onPress={confirmCode} />
        </View>
      )}
    </SafeAreaView>
}