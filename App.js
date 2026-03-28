import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Map from "./src/screens/Map";
import AllMap from "./src/screens/AllMap";
import BottomTabScreen from "./src/screens/BottomTopScreen";

import Setting from "./src/screens/Setting";
// import Login from "./src/screens/Login";
// import UserSignup from "./src/screens/UserSignup";
import { AuthProvider } from "./src/services/context";
import Bookmarks from "./src/screens/mypage/Bookmarks";
import SearchResult from "./src/screens/SearchResult";
import Likes from "./src/screens/mypage/Likes";
import History from "./src/screens/mypage/History";
// import AccFind from "./src/screens/AccFind";
import FollowList from "./src/screens/mypage/FollowList";
// import Profile from "./src/screens/reviews/Profile";
import Toast from "react-native-toast-message";
import Notification from "./src/screens/notify/Notification";

export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Bottom" component={BottomTabScreen} />
          <Stack.Screen
            name="Map"
            component={Map}
            options={{ animation: "none" }}
          />
          <Stack.Screen name="AllMap" component={AllMap} />
          <Stack.Screen name="SearchResult" component={SearchResult} />
          {/* <Stack.Screen name="Status" component={Status} /> */}
          <Stack.Screen
            name="Setting"
            component={Setting}
            options={{ animation: "none" }}
          />
          {/* <Stack.Screen name="Bookmarks" component={Bookmarks} />
          <Stack.Screen name="Likes" component={Likes} />
          <Stack.Screen name="History" component={History} />
          <Stack.Screen name="FollowList" component={FollowList} /> */}
          {/* <Stack.Screen name="Profile" component={Profile} /> */}
          {/* <Stack.Screen name="Login" component={Login} /> */}
          {/* <Stack.Screen name="Signup" component={UserSignup} /> */}
          <Stack.Screen name="Notify" component={Notification} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast topOffset={60} />
    </AuthProvider>
  );
}
