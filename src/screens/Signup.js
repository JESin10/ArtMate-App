import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
  SafeAreaView,
  ScrollView,
} from "react-native";
import React from "react";

export default function Signup() {
  const signup = () => {};
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
        <View style={styles.container}>
          <View
            style={{
              borderColor: "red",
              borderWidth: 1,
              width: "100%",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
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
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#333",
              }}
            >
              ArtMate-Slogan
            </Text>
          </View>
          {/* <TouchableOpacity> */}
          <View>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder="ID" />
              <TextInput style={styles.input} placeholder="PW" />
              <View style={styles.button}>
                <Button title="Sign Up" color={"gray"} onPress={signup} />
              </View>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "60%",
              marginHorizontal: "auto",
            }}
          >
            <Text>ID 찾기</Text>
            <Text>PW 찾기</Text>
          </View>
          {/* </TouchableOpacity> */}
        </View>
        <View>
          <Text>소셜로 시작하기</Text>
          <View
            style={{
              marginHorizontal: "auto",
              width: "100%",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <View
              style={{
                backgroundColor: "yellow",
                borderRadius: 20,
                width: "70%",
                marginBottom: 10,
              }}
            >
              <Button
                title="카카오로시작하기"
                color={"black"}
                onPress={signup}
              />
            </View>
            <View
              style={{
                backgroundColor: "green",
                borderRadius: 20,
                width: "70%",
                marginBottom: 10,
              }}
            >
              <Button
                title="네이버로 시작하기"
                color={"black"}
                onPress={signup}
              />
            </View>
            <View
              style={{
                backgroundColor: "white",
                borderColor: "black",
                borderWidth: 1,
                borderRadius: 20,
                width: "70%",
                marginBottom: 10,
              }}
            >
              <Button
                title="구글로 시작하기"
                color={"black"}
                onPress={signup}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: 300,
    height: 50,
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  inputContainer: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    padding: 10,
  },
  button: {
    width: 300,
    height: "auto",
    backgroundColor: "black",
    borderRadius: 10,

    alignItems: "center",
    padding: 10,
  },
});
