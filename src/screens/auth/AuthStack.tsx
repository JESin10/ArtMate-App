import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AccFind from "./AccFind";
import SignIn from "./SignIn";
import Signup from "./Signup";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignIn} options={{ animation: "none" }} />
      <Stack.Screen name="Signup" component={Signup} options={{ animation: "none" }} />
      <Stack.Screen name="AccFind" component={AccFind} options={{ animation: "none" }} />
    </Stack.Navigator>
  );
}
