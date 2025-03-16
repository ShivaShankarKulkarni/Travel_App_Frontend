import { BACKEND_URL } from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native";
// import { useFlag } from "../context/FlagContext";


interface Captain {
    id: number;
    username: string;
    fullName: string;
    phoneNumber: string;
}


interface Journey{
    "id": number;
    "startingLoc": string;
    "destinationLoc": string;
    "startTime": string;
    "captain": Captain;
    "route": any;
}

export default function Dashboard(){
    // const { flag } = useFlag();
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [journeys1, setJourneys1] = useState<Journey[]>([]);
    const[filter,setFilter] = useState("");
    const [sort,setSort] = useState<"early"|"slowly">("early");


    // Getting all the journyes:
    useEffect(()=>{
        const getToken = async () => {
            if (Platform.OS === "web") {
              return localStorage.getItem("token");
            } else {
              return await AsyncStorage.getItem("token");
            }
          };
        
        async function fetchJourneys(){
            try{
                const token = await getToken();
                const response = await axios.get(`${BACKEND_URL}/v1/journey/journeys`,{
                    headers: {
                        Authorization: token
                    }
                })
                setJourneys(response.data.journeys);
                setJourneys1(response.data.journeys);
            }catch(error){
                console.log(error);
            }
        }
        fetchJourneys();
    },[]);


    // Filtering and Sorting of Journeys:
    useEffect(()=>{
        let updatedJourneys = [...journeys];
        // Apply Filter First
        if (filter.trim() !== "") {
            updatedJourneys = updatedJourneys.filter((journey) =>
                journey.route.some((rou: string) =>
                    rou.toLowerCase().includes(filter.toLowerCase())
                )
            );
        }
        // Apply Sorting Next
        if (sort === "early") {
            updatedJourneys.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        } else if (sort === "slowly") {
            updatedJourneys.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        }
        setJourneys1(updatedJourneys);
    },[filter, sort, journeys])


    // Deleting journey:
    async function deleteJourney(journeyId: number){
        try{
            await axios.delete(`${BACKEND_URL}/v1/journey/journey`,{
                data:{
                    id: journeyId
                },
                headers: {
                    Authorization: localStorage.getItem("token"),
                }
            })
            alert("Deletion Successfull");
        }catch(error){
            alert("Deletion Unsuccessfull");
        }
    }

    function viceversaSort(){
        console.log("Called")
        if(sort== "early"){
            setSort("slowly")
        }
        else{
            setSort("early")
        }
    }

    return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.wrapper}>
            {/* Table Container */}
            <View style={styles.table}>
                {/* Table Head */}
                <View style={styles.table_head}>
                    {/* Columns */}
                    <View style={{width: "20%"}}>
                        <Text style={styles.table_caption}>
                            Start Time
                        </Text>
                    </View>
                    <View style={{width: "40%"}}>
                        <Text style={styles.table_caption}>
                            Route
                        </Text>
                    </View>
                    <View style={{width: "40%"}}>
                        <Text style={styles.table_caption}>
                            Captain
                        </Text>
                    </View>
                </View>
            </View>

            {journeys1.length > 0 ? 
                journeys1.map((journey)=>(
                    <View style={styles.table} key={journey.id}>
                {/* Table Body */}
                <View style={styles.table_body}>
                    {/* Columns */}
                    <View style={{width: "20%"}}>
                        <Text style={styles.table_data}>
                            {new Date(journey.startTime).toLocaleDateString()}{"\n"}
                            {new Date(journey.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <View style={{width: "40%"}}>
                        <Text style={styles.table_data}>
                            <Text style={{fontWeight:'bold', color: "red"}}>{journey.startingLoc }</Text>
                            <Text> → </Text>
                            {Array.isArray(journey.route) && journey.route.length > 0 ? (
                                journey.route.join(" → ")
                            ) : (
                                null
                            )}
                            <Text> → </Text>
                            <Text style={{fontWeight:'bold',color: "red"}}>{journey.destinationLoc }</Text>
                        </Text>
                    </View>
                    <View style={{width: "40%"}}>
                        <Text style={styles.table_data}>
                        <Text style={{fontWeight:"bold"}}>{journey.captain.fullName} {"\n"}</Text>
                        {journey.captain.phoneNumber}
                        </Text>
                    </View>
                </View>
            </View>
                ))
            : <View>
                <Text>
                    No routes available
                </Text>
                </View>}
            {/* Need to perform Delete Journey: Dynamic Routes: To check which one is the current user's route */}
        </View>    
    </ScrollView>   

)
};


const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    wrapper: {
        justifyContent: 'center',
        alignItems: "center",
        flex: 1,
        padding: 15,
        backgroundColor: "#f5f5f5",
    },
    table:{
        margin: 15,
        borderRadius: 8,
        width: "95%",
        alignItems: "center",
    },
    table_head: {
        backgroundColor: "#34495e",
        flexDirection: "row",
        padding: 10
    },
    table_caption: {
        fontWeight: 'bold',
        color: "#ecf0f1",
        textAlign: "center",
        fontSize: 18
    },
    table_body: {
        backgroundColor: "#ffffff",
        flexDirection: "row",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    table_data: {
        fontSize: 13,
        padding: 5,
        color: "#2c3e50",
        textAlign: "center",
    }
})