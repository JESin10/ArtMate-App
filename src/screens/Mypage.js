import { View, Text, SafeAreaView, ScrollView } from "react-native";
import React from "react";

export default function Mypage() {
  return (
    <SafeAreaView
      style={{
        width: "100%",
        height: "100%",
        marginHorizontal: "auto",
        flexDirection: "column",
      }}
    >
      <ScrollView>
        <Text>Mypage</Text>
      </ScrollView>
    </SafeAreaView>
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
