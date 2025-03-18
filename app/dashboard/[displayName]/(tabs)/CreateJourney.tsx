import {  ScrollView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react"
import { JourneyDate } from "travel-app-common";
import { LabelledInput } from "@/components/Auth";
import axios from "axios";
import { z } from "zod";
import { BACKEND_URL } from "@/config";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useJourney } from "../../../context/JourneyContext";
import { journeyPost } from "travel-app-common";
import { SafeAreaProvider } from "react-native-safe-area-context";


export default function CreateJourney(){
    const { setRefresh } = useJourney();
    const router = useRouter();
    const { displayName } = useLocalSearchParams();
    const [journeyInputs, setJourneyInputs] = useState<JourneyDate>({
        startingLoc: "",
        destinationLoc: "",
        startTime: new Date(),
        route: [] as string[]
    })
    const [startTime, setStartTime] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
     // Function to Validate Inputs
    const validateInputs = () => {
        try {
            journeyPost.parse(journeyInputs);
            setErrors({});
            return true; // Validation passed
        } catch (error) {
        if (error instanceof z.ZodError) {
            const formattedErrors: { [key: string]: string } = {};
            error.errors.forEach((err) => {
            formattedErrors[err.path[0]] = err.message;
            });
            setErrors(formattedErrors);
        }
        return false; 
        }
    };


    async function sendRequest(){
        if (!validateInputs()) {
            return; // Stop if validation fails
        }
        const getToken = async () => {
            if (Platform.OS === "web") {
              return localStorage.getItem("token");
            } else {
              return await AsyncStorage.getItem("token");
            }
        };
        try{
            const response = await axios.post(`${BACKEND_URL}/v1/journey/journey`, journeyInputs, {
                headers: {
                    Authorization: await getToken()
                }
            });
            setRefresh((prev: boolean) => !prev);
            if (Platform.OS === "web") {
                return router.push(`/dashboard/${displayName}`);
            }else {
                setJourneyInputs({
                    startingLoc: "",
                    destinationLoc: "",
                    startTime: new Date(),
                    route: [] as string[]
                })
                return router.push(`/dashboard/${displayName}`);
            }
        }catch (error: any) {
            if (error.response) {
                const { status } = error.response;
                let errorMessage = "Something went wrong.";
                if (status === 400) errorMessage = "Invalid input. Please check your details.";
                else if (status === 500) errorMessage = "Server error. Please try again later.";
        
                alert(errorMessage);
            } else {
                alert("Network error. Please check your connection.");
            }
        }
    }

    const [checkpoint, setCheckpoint] = useState(""); // ✅ State for new checkpoint input

    const addCheckpoint = () => {
        if (checkpoint.trim() !== "") {
            setJourneyInputs((prev) => ({
                ...prev,
                route: [...prev.route, checkpoint.trim()] // ✅ Append new checkpoint
            }));
            setCheckpoint(""); // ✅ Clear input after adding
        }
    };

    const removeCheckpoint = (index: number) => {
        setJourneyInputs((prev) => ({
            ...prev,
            route: prev.route.filter((_: string, i: number) => i !== index) // ✅ Remove checkpoint by index
        }));
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        
        if (selectedDate) {
          setStartTime(selectedDate);
          setJourneyInputs({
            ...journeyInputs,
            startTime: selectedDate
          })
        }
        if (Platform.OS === "android") {
            setShowPicker(false);
        }
      };

    return (
            <ScrollView>
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <LabelledInput label="Starting Location" error={errors.startingLoc} placeholder="Place A" value={journeyInputs.startingLoc} onChangeText={(text)=>{
                    setJourneyInputs({
                        ...journeyInputs,
                        startingLoc: text
                    })
                }}></LabelledInput>
                <LabelledInput label="Destination Location" error={errors.destinationLoc} placeholder="Place B" onChangeText={(text)=>{
                    setJourneyInputs({
                        ...journeyInputs,
                        destinationLoc: text
                    })
                }}></LabelledInput>
                <View style={{paddingBottom: 8}} >
                    <Text style={styles.label}>Start Time:</Text>
                    <Pressable onPress={() => setShowPicker(!showPicker)}>
                        <Text style={styles.inputDate}>{startTime.toLocaleString()}</Text>
                    </Pressable>

                    {/* Render DateTimePicker when showPicker is true */}
                    {showPicker && (
                        <DateTimePicker
                        value={journeyInputs.startTime}
                        mode="datetime"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleDateChange}
                        />
                    )}
                     {errors.startTime && <Text style={styles.errorText}>{errors.startTime}</Text>}
                </View>
                
                <View style={styles.checkpointContainer}>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Enter Checkpoint" 
                        onChangeText={(text) => setCheckpoint(text)}
                    />
                    <Pressable style={styles.addButton} onPress={addCheckpoint}>
                        <Text style={styles.buttonText}>Add Checkpoint</Text>
                    </Pressable>
                </View>
                {errors.route && <Text style={styles.errorText}>{errors.route}</Text>}
                <Text style={styles.infoText}>Enter one checkpoint at a time and Click on Add</Text>
                
                <View style={styles.routeList}>
                    {journeyInputs.route.map((point: string, index: number) => (
                        <View key={index} style={styles.routeItem}>
                            <Text style={styles.routeText}>{point}</Text>
                            <Pressable onPress={() => removeCheckpoint(index)}>
                                <Text style={styles.removeButton}>✖</Text>
                            </Pressable>
                        </View>
                    ))}
                </View>
                <Pressable style={styles.createButton} onPress={sendRequest}>
                    <Text style={styles.buttonText}>Create Journey</Text>
                </Pressable>
            </View>
            </View>
            </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    inputContainer: {
        width: "100%",
        maxWidth: 400,
    },
    checkpointContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    },
    input: {
        flex: 1,
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#CED4DA",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    addButton: {
        marginLeft: 10,
        backgroundColor: "#007BFF",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    infoText: {
        textAlign: "center",
        color: "#6C757D",
        marginBottom: 10,
    },
    routeList: {
        marginVertical: 10,
    },
    routeItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#EEE",
        padding: 10,
        borderRadius: 8,
        marginVertical: 5,
    },
    routeText: {
        fontSize: 16,
    },
    removeButton: {
        color: "#E74C3C",
        fontWeight: "bold",
    },
    createButton: {
        backgroundColor: "#28A745",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 5,
        color: "#333",
      },
      inputDate: {
        backgroundColor: "#FFF",
        color: "#808080",
        borderWidth: 1,
        borderColor: "#CED4DA",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        width: "100%",    // ✅ Makes sure input takes full space
        minWidth: 300,
      },
      errorText: {
        color: "#E74C3C",
        fontSize: 14,
        marginTop: 4,
    },
});