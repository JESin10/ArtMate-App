import { View, Text, SafeAreaView, ScrollView } from "react-native";
import React from "react";

export default function Review() {
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
        <Text>Review</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
