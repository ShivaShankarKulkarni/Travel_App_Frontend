import { Platform } from "react-native";

export const BACKEND_URL = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";