import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./src/store/context";
import Toast from "react-native-toast-message";
import Map from "./src/screens/places/Map.js";
import AllMap from "./src/screens/places/AllMap.js";
import SearchResult from "./src/screens/search/SearchResult.js";
import Setting from "./src/screens/settings/Setting";
import BottomTopScreen from "./src/screens/navigation/BottomTopScreen";

export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Bottom" component={BottomTopScreen} />
          <Stack.Screen
            name="Map"
            component={Map}
            options={{ animation: "none" }}
          />
          <Stack.Screen name="AllMap" component={AllMap} />
          <Stack.Screen name="SearchResult" component={SearchResult} />
          <Stack.Screen
            name="Setting"
            component={Setting}
            options={{ animation: "none" }}
          />
          {/* <Stack.Screen name="Notify" component={Notification} /> */}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast topOffset={60} />
    </AuthProvider>
  );
}
