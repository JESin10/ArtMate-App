import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Likes from "./Likes";
import Mypage from "./Mypage";
import FollowList from "./FollowList";
import Bookmarks from "./Bookmarks";
import History from "./History";

const Stack = createNativeStackNavigator();

export default function MyPageStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Mypage" component={Mypage} />
      <Stack.Screen
        name="Bookmarks"
        component={Bookmarks}
        options={{ animation: "none" }}
      />
      <Stack.Screen
        name="Likes"
        component={Likes}
        options={{ animation: "none" }}
      />
      <Stack.Screen
        name="History"
        component={History}
        options={{ animation: "none" }}
      />
      <Stack.Screen
        name="FollowList"
        component={FollowList}
        options={{ animation: "none" }}
      />
    </Stack.Navigator>
  );
}
