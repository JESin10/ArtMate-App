import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
} from "react-native";
import React from "react";

export default function Signup() {
  const signup = () => {};
  return (
    <View style={styles.container}>
      <View>
        <Text>ArtMate-Logo</Text>
        <Text>ArtMate-Slogan</Text>
      </View>
      <TouchableOpacity>
        <View>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="ID" />
            <TextInput style={styles.input} placeholder="PW" />
            <View style={styles.button}>
              <Button title="Sign Up" color={"gray"} onPress={signup} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
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
