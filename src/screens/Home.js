import { View, Text, StyleSheet, TextInput } from "react-native";
import React from "react";

export default function Home() {
  return (
    <View style={styles.container}>
      <View style={styles.searchbar}>
        <TextInput placeholder="search-bar" />
      </View>
      <View style={styles.subTitle}>
        <Text>ㅇㅇ님의 취향저격 전시모음</Text>
      </View>

      <View style={styles.subTitle}>
        <Text>금주의 최신 전시모음</Text>
      </View>

      <View style={styles.subTitle}>
        <Text>종료예정 전시모음</Text>
      </View>

      {/* <Text style={styles.title}>Home Screen</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  searchbar: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: "80%",
    padding: 10,
    marginVertical: 15,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  subTitle: {
    fontSize: 22,
    fontWeight: "semibold",
    alignItems: "flex-start",
    width: "80%",
  },
});
