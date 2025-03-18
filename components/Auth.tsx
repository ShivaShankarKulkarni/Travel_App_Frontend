import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Button, Platform, StyleSheet, Text, TextInput, View } from "react-native"
import { SigninInput, SignupInput } from "travel-app-common";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Auth = ({type}: {type: "signup" | "signin"})=>{
    const router = useRouter();

    const [postInputs, setPostInputs] = useState<SignupInput>({
        username: "",
        password: "",
        fullName: "",
        phoneNumber: ""
    })

    async function sendRequest(){
        const response = await axios.post(`${BACKEND_URL}/v1/user/${type == "signin"? "signin" : "signup"}`, postInputs);
        const jwt = response.data.token;
        const displayName = response.data.newUser.fullName
        if(Platform.OS === "web"){
            localStorage.setItem("token", jwt);
        }
        else{
            await AsyncStorage.setItem("token", jwt);
        }
        // router.push(`/dashboard/${displayName}`);
        router.push({
            pathname: "/dashboard/[displayName]",
            params: { displayName: encodeURIComponent(displayName) },
        });
    }
    return <>
    <View style={styles.container}>
        <Text style={styles.title}>
            {type === "signin" ? "Login to your Account" : "Create an Account"}
        </Text>
        <Text style={styles.subtitle}>
            {type === "signin" ? "Don't have an account?" : "Already have an account?"}
            <Link style={styles.link} href={type === "signin" ? "/signup" : "/signin"}>
              {type === "signin" ? " Signup" : " Sign In"}
            </Link>
        </Text>
    <View style={styles.inputContainer}>
        <LabelledInput label="Username" placeholder="abc" onChangeText={(text)=>{
            setPostInputs({
                ...postInputs,
                username: text
            })
        }}></LabelledInput>
        <LabelledInput label="Password" placeholder="1234567890" isPassword={true} onChangeText={(text)=>{
            setPostInputs({
                ...postInputs,
                password: text
            })
        }}></LabelledInput>

        {type === "signup"? 
            <LabelledInput label="FullName" placeholder="ABCDEFGHIJKL" onChangeText={(text)=>{
                setPostInputs({
                    ...postInputs,
                    fullName: text
                })
            }}></LabelledInput>
        : null}

        {type === "signup"? 
            <LabelledInput label="PhoneNumber" placeholder="1234567890" onChangeText={(text)=>{
                setPostInputs({
                    ...postInputs,
                    phoneNumber: text
                })
            }}></LabelledInput>
        : null}
        <View style={styles.buttonContainer}>
            <Button title={type === "signin" ? "Sign In" : "Sign Up"} onPress={sendRequest} />
        </View>
    </View>
    </View>
    </>
}


interface LabelledInputType{
    label: string;
    placeholder: string;
    onChangeText: (text: string)=> void;
    isPassword?: boolean;
    value? : string;
    type?: string;
}

export function LabelledInput({label, placeholder, onChangeText, isPassword=false}: LabelledInputType){
    return (
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>
                {label}
            </Text>
            <TextInput  autoCapitalize='none' style={styles.input} placeholder={placeholder} onChangeText={onChangeText} keyboardType="default" secureTextEntry={isPassword} ></TextInput>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8F9FA",
      padding: 20,
      paddingHorizontal: 20,  // ✅ Use horizontal padding only
      paddingVertical: 50,    // ✅ Adjust vertical padding
      justifyContent: "center",  // ✅ Center content vertically
      alignItems: "center",   // ✅ Center content horizontally
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 10,
    },
    subtitle: {
      textAlign: "center",
      color: "#6C757D",
      marginBottom: 20,
    },
    link: {
      color: "#007BFF",
      fontWeight: "bold",
    },
    inputContainer: {
      marginTop: 20,
    },
    inputWrapper: {
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 5,
      color: "#333",
    },
    input: {
      backgroundColor: "#FFF",
      borderWidth: 1,
      borderColor: "#CED4DA",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      width: "100%",    // ✅ Makes sure input takes full space
      minWidth: 300,
    },
    buttonContainer: {
      marginTop: 20,
    },
  });