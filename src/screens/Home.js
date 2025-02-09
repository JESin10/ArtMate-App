import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import React from "react";

export default function Home() {
  return (
    <SafeAreaView>
      <ScrollView>
        {/* <TouchableOpacity style={styles.container}> */}
        <View style={styles.container}>
          <Text
            style={{
              fontSize: 35,
              fontWeight: "bold",
              color: "#333",
              marginVertical: 15,
            }}
          >
            ArtMate-Logo
          </Text>
          <View style={styles.searchbar}>
            <TextInput placeholder="search-bar" />
          </View>
          <View style={styles.recommandContainer}>
            <View style={styles.subTitle}>
              <Text>ㅇㅇ님의 취향저격 전시모음</Text>
            </View>
            <View style={styles.recommandedImages}>
              <Text>images</Text>
            </View>
          </View>
          <View style={styles.recentContainer}>
            <View style={styles.subTitle}>
              <Text>금주의 최신 전시모음</Text>
            </View>
            <View style={styles.recentImages}>
              <Text>images</Text>
            </View>
          </View>
          <View style={styles.endedContainer}>
            <View style={styles.subTitle}>
              <Text>종료예정 전시모음</Text>
            </View>
            <View style={styles.endedImages}>
              <Text>images</Text>
            </View>
          </View>
          <View style={styles.artistContainer}>
            <View style={styles.subTitle}>
              <Text>현재 전시중인 작가</Text>
            </View>
            <View style={styles.artistImages}>
              <Text>images</Text>
            </View>
          </View>

          {/* <Text style={styles.title}>Home Screen</Text> */}
        </View>
        {/* </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: "yellow",
    borderWidth: 5,
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
    width: "90%",
    padding: 10,
    marginVertical: 15,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  subTitle: {
    fontSize: 22,
    fontWeight: "semibold",
    alignItems: "flex-start",
    width: "100%",
    paddingVertical: 10,
  },
  recommandedImages: {
    width: "100%",
    height: 400,
    borderColor: "black",
    borderWidth: 1,
  },
  recentImages: {
    width: "100%",
    height: 200,
    borderColor: "black",
    borderWidth: 1,
  },
  endedImages: {
    width: "100%",
    height: 200,
    borderColor: "black",
    borderWidth: 1,
  },
  artistImages: {
    width: "100%",
    height: 100,
    borderColor: "black",
    borderWidth: 1,
  },
  recommandContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    borderColor: "red",
    borderWidth: 2,
    height: "auto",
    padding: 20,
    marginBottom: 10,
  },
  recentContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    borderColor: "blue",
    borderWidth: 2,
    height: "auto",
    padding: 20,
    marginBottom: 10,
  },
  endedContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    borderColor: "green",
    borderWidth: 2,
    height: "auto",
    padding: 20,
    marginBottom: 10,
  },
  artistContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    borderColor: "purple",
    borderWidth: 2,
    height: "auto",
    padding: 20,
  },
});
