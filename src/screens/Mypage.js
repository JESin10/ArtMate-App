import { View, Text } from "react-native";
import React from "react";

export default function Mypage() {
  return (
    <View>
      <Text>Mypage</Text>
      <View>
        <View></View>
      </View>
    </View>
  );
}

const StyleSheet = {
  View: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  Text: {
    fontSize: 20,
  },
};
