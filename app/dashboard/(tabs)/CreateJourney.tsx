import { Button, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react"
import { JourneyDate } from "travel-app-common";
import { LabelledInput } from "@/components/Auth";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useFlag } from "@/app/context/FlagContext";

export default function CreateJourney(){
    // const { setFlag } = useFlag();
    const router = useRouter();
    const [journeyInputs, setJourneyInputs] = useState<JourneyDate>({
        startingLoc: "",
        destinationLoc: "",
        startTime: new Date(),
        route: [] as string[]
    })
    const [startTime, setStartTime] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState(false);
    
    async function sendRequest(){
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
            // setFlag((prevFlag: boolean) => !prevFlag); // Toggle the flag
            router.push("/dashboard");
        }catch(e){
            // Alert here
            alert("Not saved! \n Some Error");
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
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <LabelledInput label="Starting Location" placeholder="Place A" value={journeyInputs.startingLoc} onChangeText={(text)=>{
                    setJourneyInputs({
                        ...journeyInputs,
                        startingLoc: text
                    })
                }}></LabelledInput>
                <LabelledInput label="Destination Location" placeholder="Place B" onChangeText={(text)=>{
                    setJourneyInputs({
                        ...journeyInputs,
                        destinationLoc: text
                    })
                }}></LabelledInput>
                {/* <LabelledInput label="Start Time" placeholder="Select Start Time" value={journeyInputs.startTime.toISOString().slice(0, 16)} type="datetime-local" onChangeText={(text)=>{
                    setJourneyInputs({
                        ...journeyInputs,
                        startTime: new Date(text)
                    })
                }}></LabelledInput> */}

                <View style={{ padding: 20 }}>
                    <Text style={{ fontSize: 16, marginBottom: 10 }}>Start Time:</Text>

                    {/* Show selected DateTime */}
                    <Button title={startTime.toLocaleString()} onPress={() => setShowPicker(true)} />

                    {/* Render DateTimePicker when showPicker is true */}
                    {showPicker && (
                        <DateTimePicker
                        value={journeyInputs.startTime}
                        mode="datetime"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleDateChange}
                        />
                    )}
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
});