import { View, Text } from "react-native";
import React from "react";

export default function UserSignup() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isUser, setIsUser] = useState(false);
  return (
    <View>
      <Text>UserSignup</Text>
    </View>
  );
}
