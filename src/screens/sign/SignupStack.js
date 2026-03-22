import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./Login";
import UserSignup from "./UserSignup";
import AccFind from "./AccFind";

const Stack = createNativeStackNavigator();

export default function SignupStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ animation: "none" }}
      />
      <Stack.Screen
        name="Signup"
        component={UserSignup}
        options={{ animation: "none" }}
      />
      <Stack.Screen
        name="AccFind"
        component={AccFind}
        options={{ animation: "none" }}
      />
    </Stack.Navigator>
  );
}
