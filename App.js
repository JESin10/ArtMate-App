import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Map from "./src/screens/Map";
import AllMap from "./src/screens/AllMap";
import BottomTabScreen from "./src/screens/BottomTopScreen";

import Setting from "./src/screens/Setting";
import Login from "./src/screens/Login";
import UserSignup from "./src/screens/UserSignup";
import { AuthContext, AuthProvider } from "./src/services/context";
import Bookmarks from "./src/screens/Bookmarks";
import SearchResult from "./src/screens/SearchResult";

export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Bottom" component={BottomTabScreen} />
          <Stack.Screen name="Map" component={Map} />
          <Stack.Screen name="AllMap" component={AllMap} />
          <Stack.Screen name="SearchResult" component={SearchResult} />
          {/* <Stack.Screen name="Status" component={Status} /> */}
          <Stack.Screen name="Setting" component={Setting} />
          <Stack.Screen name="Bookmarks" component={Bookmarks} />

          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={UserSignup} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
