import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Home from "./src/screens/Home";
import Search from "./src/screens/Search";
import Review from "./src/screens/Review";
import Artworks from "./src/screens/Artworks";
import Places from "./src/screens/Places";
import Status from "./src/screens/Status";
import Mypage from "./src/screens/Mypage";
import Signup from "./src/screens/Signup";

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
            height: 70,
          },
          // tabBarIcon: ({ focused, size, color }) => {
          //   let iconName;
          //   if (route.name === "Home") {
          //     iconName = focused ? "home-sharp" : "home-outline";
          //   } else if (route.name === "Search") {
          //     iconName = focused ? "search" : "search-outline";
          //   } else if (route.name === "PostAdd") {
          //     iconName = focused ? "add" : "add";
          //   } else if (route.name === "Alerts") {
          //     iconName = focused
          //       ? "chatbubble-ellipses"
          //       : "chatbubble-ellipses-outline";
          //   } else if (route.name === "Profile") {
          //     iconName = focused ? "person-circle" : "person-circle-sharp";
          //   }

          //   return <Ionic name={iconName} size={size} color={color} />;
          // },
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        {/* <Tab.Screen name="Search" component={Search} /> */}
        <Tab.Screen name="Artworks" component={Artworks} />
        <Tab.Screen name="Places" component={Places} />
        <Tab.Screen name="Review" component={Review} />
        <Tab.Screen name="Mypage" component={Mypage} />
        <Tab.Screen name="Signup" component={Signup} />
      </Tab.Navigator>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Bottom" component={BottomTabScreen} />
        <Stack.Screen name="Status" component={Status} />
        {/* <Stack.Screen name="FriendProfile" component={FriendProfile} />
        <Stack.Screen name="EditProfile" component={EditProfile} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: "red",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
