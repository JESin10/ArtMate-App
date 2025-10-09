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
        <View style={styles.settingSec}>
          <Text style={styles.settingFactor}>1</Text>
          <Text style={styles.settingFactor}>2</Text>
          <Text style={styles.settingFactor}>3</Text>
        </View>

        <View style={styles.myInfoSec}></View>
        <View style={styles.myReviewSec}></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  settingSec: {
    width: "90%",
    height: "auto",
    borderColor: "green",
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    // alignItems: "right",
    padding: 10,
    marginHorizontal: "auto",
  },
  settingFactor: {
    marginHorizontal: 10,
    borderColor: "black",
  },
  myInfoSec: {
    width: "90%",
    height: "100%",
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: "auto",
  },
  myReviewSec: {
    width: "90%",
    height: "100%",
    borderColor: "blue",
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: "auto",
  },
};
