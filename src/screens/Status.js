import { View, Text, SafeAreaView, StatusBar } from "react-native";
import React from "react";

const Status = ({ route, navigation }) => {
  const { name } = route.params;
  // const { image } = route.params;

  const statusBarHeight = getStatusBarHeight();

  return (
    <SafeAreaView
      style={{
        backgroundColor: "black",
        height: "50%",
        justifyContent: "center",
      }}
    >
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <Text>Status</Text>
    </SafeAreaView>
  );
};

export default Status;
