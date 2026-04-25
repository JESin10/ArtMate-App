import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useContext } from "react";
import ReviewIcon from "../../assets/icons/Menubar_bookmark-filled.svg";
import ReviewLineIcon from "../../assets/icons/Menubar_bookmark.svg";
import PlacesIcon from "../../assets/icons/Menubar_gallery-filled.svg";
import PlacesLineIcon from "../../assets/icons/Menubar_gallery.svg";
import HomeIcon from "../../assets/icons/Menubar_home-filled.svg";
import HomeLineIcon from "../../assets/icons/Menubar_home.svg";
import ArtworksIcon from "../../assets/icons/Menubar_image-filled.svg";
import ArtworksLineIcon from "../../assets/icons/Menubar_image.svg";
import MypageIcon from "../../assets/icons/Menubar_user-filled.svg";
import MypageLineIcon from "../../assets/icons/Menubar_user.svg";
import Artworks from "../../screens/Artworks";
import { AuthContext } from "../../store/context";
import { colors } from "../../styles/colors";
import { spacing } from "../../styles/theme";
import AuthStack from "../auth/AuthStack";
import Home from "../home/Home";
import MyPageStack from "../mypage/MyPageStack";
import PlacesScreen from "../places/PlacesScreen";
import ReviewStack from "../reviews/ReviewStack";

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
          paddingTop: spacing.sm,
          backgroundColor: colors.primary,
        },
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.white,
        tabBarIcon: ({ focused, size, color }) => {
          if (route.name === "Home") {
            return focused ? (
              <HomeIcon
                width={size ?? spacing.xxxl}
                height={size ?? spacing.xxxl}
                fill={color}
              />
            ) : (
              <HomeLineIcon
                width={size ?? spacing.xxxl}
                height={size ?? spacing.xxxl}
                fill={color}
              />
            );
          }
          if (route.name === "Artworks") {
            return focused ? (
              <ArtworksIcon
                width={size ?? spacing.xxxl}
                height={size ?? spacing.xxxl}
                fill={color}
              />
            ) : (
              <ArtworksLineIcon
                width={size ?? spacing.xxxl}
                height={size ?? spacing.xxxl}
                fill={color}
              />
            );
          }
          if (route.name === "Places") {
            return focused ? (
              <PlacesIcon
                width={size ?? spacing.xxxl}
                height={size ?? spacing.xxxl}
                fill={color}
              />
            ) : (
              <PlacesLineIcon
                width={size ?? spacing.xxxl}
                height={size ?? spacing.xxxl}
                fill={color}
              />
            );
          }
          if (route.name === "Review") {
            return focused ? (
              <ReviewIcon
                width={size ?? spacing.xxxl}
                height={size ?? spacing.xxxl}
                fill={color}
              />
            ) : (
              <ReviewLineIcon
                width={size ?? spacing.xxxl}
                height={size ?? spacing.xxxl}
                fill={color}
              />
            );
          }
          if (route.name === "Mypage") {
            return focused ? (
              <MypageIcon
                width={size ?? spacing.xxxl}
                height={size ?? spacing.xxxl}
                fill={color}
              />
            ) : (
              <MypageLineIcon
                width={size ?? spacing.xxxl}
                height={size ?? spacing.xxxl}
                fill={color}
              />
            );
          }
          if (route.name === "Auth") {
            return focused ? (
              <MypageIcon
                width={size ?? spacing.xxxl}
                height={size ?? spacing.xxxl}
                fill={color}
              />
            ) : (
              <MypageLineIcon
                width={size ?? spacing.xxxl}
                height={size ?? spacing.xxxl}
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
