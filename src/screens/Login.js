import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState, useContext } from "react";
import Mainlogo from "../assets/icons/logo-main.svg";
import MainSlogun from "../assets/images/slogan.svg";
import { collection, doc, getDoc, getDocs, where } from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../services/context";
import { deleteUser, getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default function Login({ navigation }) {
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [userName, setUserName] = useState("");
  const { setUser } = useContext(AuthContext);
  const auth = getAuth();

  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userId,
        userPw,
      );

      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, "users", uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          uid,
          email: userData.email,
          displayName: userData.displayName,
          follower: userData.followers,
          following: userData.following,
        });
      }
      Alert.alert("로그인 성공", "로그인이 완료되었습니다.");
      navigation.navigate("Bottom", { screen: "Home" });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView
      style={{
        width: "100%",
        height: "100%",
        marginHorizontal: "auto",
        flexDirection: "column",
        backgroundColor: "white",
      }}
    >
      <ScrollView>
        <View style={styles.container}>
          <View
            style={{
              // borderColor: "red",
              // borderWidth: 1,
              width: "100%",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate("Bottom", { screen: "Home" })}
              style={{ alignItems: "center", marginBottom: 100 }}
            >
              <Mainlogo width={240} height={100} />
              <MainSlogun width={220} height={30} />
            </TouchableOpacity>
          </View>
          {/* <TouchableOpacity> */}
          <View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="아이디"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="id"
                value={userId}
                onChangeText={(text) => setUserId(text)}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={true}
                textContentType="password"
                value={userPw}
                onChangeText={(text) => setUserPw(text)}
              />

              <TouchableOpacity style={styles.button} onPress={login}>
                <Text style={{ color: "#fff" }}>로그인</Text>
              </TouchableOpacity>
              {/* <Button title="Sign Up" color={"gray"} onPress={signup} /> */}
            </View>
          </View>
          <View style={styles.findContainer}>
            <TouchableOpacity>
              <Text style={styles.findFactor}>ID 찾기</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.findFactor}>PW 찾기</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.findFactor}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <View style={styles.decoLine}>
            <Text
              style={{
                paddingHorizontal: 15,
                backgroundColor: "white",
                zIndex: 20,
                top: 10,
                color: "#A8A8A8",
                fontSize: 12,
              }}
            >
              소셜로 시작하기
            </Text>
          </View>
          <View
            style={{
              marginHorizontal: "auto",
              width: "100%",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#F4DF4A",
                borderRadius: 30,
                width: "80%",
                height: 45,
                marginBottom: 10,
                alignItems: "center",
              }}
              onPress={login}
            >
              <Text style={styles.socialBtn}>카카오로 시작하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "#5EC439",
                borderRadius: 30,
                width: "80%",
                height: 45,
                marginBottom: 10,
                alignItems: "center",
              }}
              onPress={login}
            >
              <Text style={styles.socialBtn}>네이버로 시작하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "white",
                borderColor: "black",
                borderWidth: 1,
                borderRadius: 30,
                width: "80%",
                height: 45,
                marginBottom: 10,
                alignItems: "center",
              }}
              onPress={login}
            >
              <Text style={styles.socialBtn}>구글로 시작하기</Text>
            </TouchableOpacity>
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
    height: 45,
    backgroundColor: "white",
    borderColor: "#608D00",
    borderWidth: 1,
    borderRadius: 30,
    padding: 10,
    marginBottom: 10,
    textAlign: "center",
    placeholderTextColor: "#6F6F6F",
  },
  inputContainer: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    padding: 10,
  },
  button: {
    width: 300,
    height: 45,

    height: "auto",
    backgroundColor: "#608D00",
    borderRadius: 30,
    margin: 10,
    alignItems: "center",
    padding: 15,
  },
  socialBtn: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    lineHeight: 45,
    fontSize: 14,
    fontWeight: "bold",
    alignItems: "center",
    flexDirection: "center",
  },
  decoLine: {
    width: "80%",
    justifyContent: "center",
    borderBottomColor: "#A8A8A8",
    borderBottomWidth: 1,
    marginTop: 30,
    marginBottom: 40,
    alignItems: "center",
    marginHorizontal: "auto",
  },
  findContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginHorizontal: "auto",
  },
  findFactor: {
    color: "gray",
    fontSize: 10,
    fontWeight: "semibold",
    marginBottom: 20,
  },
});
