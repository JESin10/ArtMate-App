import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useContext } from "react";
import Artworks from "../../screens/Artworks";
import Home from "../../screens/Home";
import HomeIcon from "../../assets/icons/Menubar_home-filled.svg";
import HomeLineIcon from "../../assets/icons/Menubar_home.svg";
import ArtworksIcon from "../../assets/icons/Menubar_image-filled.svg";
import ArtworksLineIcon from "../../assets/icons/Menubar_image.svg";
import PlacesIcon from "../../assets/icons/Menubar_gallery-filled.svg";
import PlacesLineIcon from "../../assets/icons/Menubar_gallery.svg";
import ReviewIcon from "../../assets/icons/Menubar_bookmark-filled.svg";
import ReviewLineIcon from "../../assets/icons/Menubar_bookmark.svg";
import MypageIcon from "../../assets/icons/Menubar_user-filled.svg";
import MypageLineIcon from "../../assets/icons/Menubar_user.svg";
import { AuthContext } from "../../store/context";
import PlacesScreen from "../places/PlacesScreen";
import ReviewStack from "../reviews/ReviewStack";
import MyPageStack from "../mypage/MyPageStack";
import AuthStack from "../auth/AuthStack";

export default function BottomTopScreen() {
  const Tab = createBottomTabNavigator();
  const { user } = useContext(AuthContext);
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
              <PlacesIcon width={size ?? 24} height={size ?? 24} fill={color} />
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
              <ReviewIcon width={size ?? 24} height={size ?? 24} fill={color} />
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
              <MypageIcon width={size ?? 24} height={size ?? 24} fill={color} />
            ) : (
              <MypageLineIcon
                width={size ?? 24}
                height={size ?? 24}
                fill={color}
              />
            );
          }
          if (route.name === "Auth") {
            return focused ? (
              <MypageIcon width={size ?? 24} height={size ?? 24} fill={color} />
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
      <Tab.Screen name="Artworks" component={Artworks} />
      <Tab.Screen name="Places" component={PlacesScreen} />
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Review" component={ReviewStack} />
      {!user ? (
        <Tab.Screen name="Auth" component={AuthStack} />
      ) : (
        <Tab.Screen name="Mypage" component={MyPageStack} />
      )}
    </Tab.Navigator>
  );
}
