import { BACKEND_URL } from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Image, Platform, Pressable, ScrollView, StyleSheet, TextInput, View, RefreshControl } from "react-native";
import { Text } from "react-native";
import { useJourney } from "../../../context/JourneyContext"; 
// import { auth } from "@/firebaseConfig";

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
    const { refresh, setRefresh } = useJourney();
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [journeys1, setJourneys1] = useState<Journey[]>([]);
    const[filter,setFilter] = useState("");
    const [sort,setSort] = useState<"early"|"slowly">("early");
    const { displayName } = useLocalSearchParams();
    const [refreshing, setRefreshing] = useState(false);

    //Checks whether the userData and auth is present, before rendering the page whenever clicked.
    // useFocusEffect(
    //     useCallback(() => {
    //         const checkUser = async () => {
    //             try {
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
    //   );


    const onRefresh = ()=>{
        setRefreshing(true);
        setTimeout(()=>{fetchJourneys();setRefreshing(false)}, 2000);
    }

    // Getting token condtionally from Android/IOS:
    const getToken = async () => {
        if (Platform.OS === "web") {
          return localStorage.getItem("token");
        } else {
          return await AsyncStorage.getItem("token");
        }
      };

    // Getting all the journyes:
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
        }catch(error: any){
            alert(error.message);
        }
    }


    useEffect(()=>{
        fetchJourneys();
    },[refresh]);


    // Filtering and Sorting of Journeys:
    useEffect(()=>{
        let updatedJourneys = [...journeys];
        // Apply Filter First
        if (filter.trim() !== "") {
            updatedJourneys = updatedJourneys.filter((journey) => 
                journey.route.some((rou: string) =>
                    rou.toLowerCase().includes(filter.toLowerCase())
                ) ||
                journey.startingLoc.toLowerCase().includes(filter.toLowerCase()) ||
                journey.destinationLoc.toLowerCase().includes(filter.toLowerCase())
            );
        }
        // Apply Sorting Next
        if (sort === "early") {
            updatedJourneys.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        } else if (sort === "slowly") {
            updatedJourneys.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        }
        // User's journeys first
        updatedJourneys.sort((a, b) => {
            const isCurrentUserA = a.captain.fullName === displayName ? 1: 0;
            const isCurrentUserB = b.captain.fullName === displayName ? 1: 0;
            
            return isCurrentUserB - isCurrentUserA; // Moves `true` values (1) before `false` values (0)
        });
        setJourneys1(updatedJourneys);
    },[filter, sort, journeys])


    // Deleting journey:
    async function deleteJourney(journeyId: number){
        const getToken = async () => {
            if (Platform.OS === "web") {
              return localStorage.getItem("token");
            } else {
              return await AsyncStorage.getItem("token");
            }
          };
        try{
            await axios.delete(`${BACKEND_URL}/v1/journey/journey`,{
                data:{
                    id: journeyId
                },
                headers: {
                    Authorization: await getToken()
                }
            })
            alert("Deletion Successfull");
            setRefresh((prev: boolean) => !prev);
        }catch(error){
            alert("Deletion Unsuccessfull");
        }
    }

    function viceversaSort(){
        if(sort== "early"){
            setSort("slowly")
        }
        else{
            setSort("early")
        }
    }

    return (
    <ScrollView contentContainerStyle={styles.scrollContainer}
        refreshControl={
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['grey']}
            progressBackgroundColor={'black'}
      />}>
    <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter:</Text>
        <TextInput
            style={styles.filterInput}
            onChangeText={(text) => setFilter(text)}
            placeholder="Start/Destination Location"
            placeholderTextColor="#7f8c8d"
        />
    </View>
    
    <View style={styles.wrapper}>
            {/* Table Container */}
            <View style={styles.table}>
                {/* Table Head */}
                <View style={styles.table_head}>
                    {/* Columns */}
                    <View style={{width: "20%"}}>
                        <Pressable onPress={viceversaSort}>
                            <View style={styles.sortContainer}>
                                <Text style={styles.table_caption}>Start Time</Text>
                                <Image 
                                    style={styles.sort_icon}  
                                    source={sort === "early" ? require("../../../../assets/images/sort-up.png") : require("../../../../assets/images/sort-down.png")} 
                                />
                            </View>
                        </Pressable>
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
                            {new Date(journey.startTime).toLocaleDateString()}
                        </Text>
                        <Text style={styles.table_time}>
                            {new Date(journey.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                    {journey.captain.fullName === displayName && (
                        <View style={{ alignItems: "center", marginTop: 5 }}>
                            <Pressable onPress={() => deleteJourney(journey.id)} style={styles.deleteButton}>
                                <Image source={require("../../../../assets/images/delete-bin.png")} style={styles.deleteIcon} />
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>
                ))
            : <View>
                <Text>
                    No routes available
                </Text>
                </View>}
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
        fontSize: 18,
    },
    sortContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center", // Centering horizontally
    },
    sort_icon: {
        width: 16,  // Adjust size as needed
        height: 16,
        marginLeft: 6,  // Adds spacing between text and icon
        tintColor: "#ecf0f1" // Matches text color
    },
    table_body: {
        backgroundColor: "#ffffff",
        flexDirection: "row",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    table_data: {
        fontSize: 11,
        fontWeight: "bold",
        padding: 4,
        color: "#2c3e50",
        textAlign: "center",
    },
    table_time: {
        fontSize: 13,
        color: "#7f8c8d",
        textAlign: "center",
    },
    filterContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        backgroundColor: "#ecf0f1",
        borderRadius: 8,
        marginVertical: 10,
        width: "95%",
        alignSelf: "center",
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2c3e50",
        marginRight: 10,
    },
    filterInput: {
        flex: 1,
        padding: 8,
        backgroundColor: "#ffffff",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#bdc3c7",
        color: "#2c3e50",
        fontSize: 14,
    },
    deleteButton: {
        backgroundColor: "#e74c3c",
        padding: 8,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        width: 32, // Fixed width to prevent resizing
        height: 32, // Square shape for icon
    },
    deleteIcon: {
        width: 18,
        height: 18,
        tintColor: "#ffffff", // White icon for contrast
    },
    actionColumn: {
        width: "10%", // Adjust this if necessary
        alignItems: "center",
        justifyContent: "center",
    }
})