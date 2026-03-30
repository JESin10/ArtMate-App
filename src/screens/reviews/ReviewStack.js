import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Review from "./Review";
import Profile from "./Profile";
import { useEffect } from "react";

const Stack = createNativeStackNavigator();

export default function ReviewStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReviewMain" component={Review} />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ animation: "none" }}
      />
    </Stack.Navigator>
  );
}
