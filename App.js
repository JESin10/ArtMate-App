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

import HomeIcon from "./src/assets/icons/Menubar_home.svg";
import ArtworksIcon from "./src/assets/icons/Menubar_image.svg";
import PlacesIcon from "./src/assets/icons/Menubar_gallery.svg";
import ReviewIcon from "./src/assets/icons/write.svg";
import MypageIcon from "./src/assets/icons/Menubar_user.svg";
import Setting from "./src/screens/Setting";
import Signup from "./src/screens/Signup";

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
            height: 70,
          },
          tabBarIcon: ({ focused, size, color }) => {
            if (route.name === "Home") {
              return (
                <HomeIcon
                  width={size ?? 24}
                  height={size ?? 24}
                  fill={focused ? "#333" : "#bbb"}
                />
              );
            }
            if (route.name === "Artworks") {
              return (
                <ArtworksIcon
                  width={size ?? 24}
                  height={size ?? 24}
                  fill={focused ? "#333" : "#bbb"}
                />
              );
            }
            if (route.name === "Places") {
              return (
                <PlacesIcon
                  width={size ?? 24}
                  height={size ?? 24}
                  fill={focused ? "#333" : "#bbb"}
                />
              );
            }
            if (route.name === "Review") {
              return (
                <ReviewIcon
                  width={size ?? 24}
                  height={size ?? 24}
                  fill={focused ? "#333" : "#bbb"}
                />
              );
            }
            if (route.name === "Mypage") {
              return (
                <MypageIcon
                  width={size ?? 24}
                  height={size ?? 24}
                  fill={focused ? "#333" : "#bbb"}
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
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Bottom" component={BottomTabScreen} />
        <Stack.Screen name="Status" component={Status} />
        <Stack.Screen name="Setting" component={Setting} />
        <Stack.Screen name="Signup" component={Signup} />
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
