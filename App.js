import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import Home from "./src/screens/Home";
import Search from "./src/screens/Search";
import Review from "./src/screens/Review";
import Artworks from "./src/screens/Artworks";
import Places from "./src/screens/Places";
import Status from "./src/screens/Status";
import Mypage from "./src/screens/Mypage";

import HomeIcon from "./src/assets/icons/Menubar_home-filled.svg";
import HomeLineIcon from "./src/assets/icons/Menubar_home.svg";
import ArtworksIcon from "./src/assets/icons/Menubar_image-filled.svg";
import ArtworksLineIcon from "./src/assets/icons/Menubar_image.svg";
import PlacesIcon from "./src/assets/icons/Menubar_gallery-filled.svg";
import PlacesLineIcon from "./src/assets/icons/Menubar_gallery.svg";
import ReviewIcon from "./src/assets/icons/Menubar_bookmark-filled.svg";
import ReviewLineIcon from "./src/assets/icons/Menubar_bookmark.svg";
import MypageIcon from "./src/assets/icons/Menubar_user-filled.svg";
import MypageLineIcon from "./src/assets/icons/Menubar_user.svg";
import Setting from "./src/screens/Setting";
import Login from "./src/screens/Login";
import UserSignup from "./src/components/UserSignup";
import MapView from "./src/screens/MapView";
import { AuthProvider } from "./src/services/context";

// import SignupIcon from "./src/assets/icons/Menubar_user.svg";

export default function App() {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  const BottomTabScreen = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: {
            height: 80,
            paddingTop: 10,
            backgroundColor: "#608D00",
          },
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#fff",
          tabBarIcon: ({ focused, size, color }) => {
            if (route.name === "Home") {
              return focused ? (
                <HomeIcon width={size ?? 24} height={size ?? 24} fill={color} />
              ) : (
                <HomeLineIcon
                  width={size ?? 24}
                  height={size ?? 24}
                  fill={color}
                />
              );
            }
            if (route.name === "Artworks") {
              return focused ? (
                <ArtworksIcon
                  width={size ?? 24}
                  height={size ?? 24}
                  fill={color}
                />
              ) : (
                <ArtworksLineIcon
                  width={size ?? 24}
                  height={size ?? 24}
                  fill={color}
                />
              );
            }
            if (route.name === "Places") {
              return focused ? (
                <PlacesIcon
                  width={size ?? 24}
                  height={size ?? 24}
                  fill={color}
                />
              ) : (
                <PlacesLineIcon
                  width={size ?? 24}
                  height={size ?? 24}
                  fill={color}
                />
              );
            }
            if (route.name === "Review") {
              return focused ? (
                <ReviewIcon
                  width={size ?? 24}
                  height={size ?? 24}
                  fill={color}
                />
              ) : (
                <ReviewLineIcon
                  width={size ?? 24}
                  height={size ?? 24}
                  fill={color}
                />
              );
            }
            if (route.name === "Mypage") {
              return focused ? (
                <MypageIcon
                  width={size ?? 24}
                  height={size ?? 24}
                  fill={color}
                />
              ) : (
                <MypageLineIcon
                  width={size ?? 24}
                  height={size ?? 24}
                  fill={color}
                />
              );
            }
            return null;
          },
        })}
      >
        {/* <Tab.Screen name="Search" component={Search} /> */}
        <Tab.Screen name="Artworks" component={Artworks} />
        <Tab.Screen name="Places" component={Places} />
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Review" component={Review} />
        <Tab.Screen name="Mypage" component={Mypage} />
      </Tab.Navigator>
    );
  };

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Bottom" component={BottomTabScreen} />
          <Stack.Screen name="Map" component={MapView} />
          {/* <Stack.Screen name="Status" component={Status} /> */}
          <Stack.Screen name="Setting" component={Setting} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={UserSignup} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     borderColor: "red",
//     borderWidth: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   menubar: {
//     backgroundColor: "#608D00",
//   },
// });
