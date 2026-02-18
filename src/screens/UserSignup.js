import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import Mainlogo from "../assets/icons/logo-main.svg";
import MainSlogun from "../assets/images/slogan.svg";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function UserSignup({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [isUser, setIsUser] = useState(false);

  const onSignup = async () => {
    // 기본 유효성 검사
    if (!email || !password || !passwordCheck) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (password !== passwordCheck) {
      Alert.alert("비밀번호 불일치", "비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);

      // 보안상 비밀번호는 DB에 저장하지 않습니다.
      await setDoc(userRef, {
        displayName: name,
        email: email,
        uid: user.uid,
        createdAt: new Date().toUTCString(),
        following: 0,
        followers: 0,
      });

      Alert.alert("회원가입 성공", "회원가입이 완료되었습니다.");
      navigation.navigate("Login");
      setIsUser(true);
    } catch (error) {
      // Firebase auth 에러 코드별 안내
      const code = error?.code || "";
      if (code === "auth/email-already-in-use") {
        Alert.alert(
          "회원가입 실패",
          "이미 사용 중인 이메일입니다. 로그인 해주세요.",
        );
      } else if (code === "auth/invalid-email") {
        Alert.alert("회원가입 실패", "유효하지 않은 이메일 형식입니다.");
      } else if (code === "auth/weak-password") {
        Alert.alert(
          "회원가입 실패",
          "비밀번호가 너무 약합니다. 6자리 이상으로 설정해주세요.",
        );
      } else {
        Alert.alert("회원가입 실패", error.message || String(error));
      }
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
          <TouchableOpacity
            onPress={() => navigation.navigate("Bottom", { screen: "Home" })}
            style={{ alignItems: "center", marginBottom: 100 }}
          >
            <Mainlogo width={240} height={100} />
            <MainSlogun width={220} height={30} />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="이메일"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoFocus={true}
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="닉네임(한/영/숫자/기호/2-10자)"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="name"
              value={name}
              onChangeText={(text) => setName(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="비밀번호 문자+숫자+특수문자 포함 8자이상"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              textContentType="password"
              value={password}
              onChangeText={(text) => setPassword(text)}
            />

            <TextInput
              style={styles.input}
              placeholder="비밀번호 확인 문자+숫자+특수문자 포함 8자이상"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              textContentType="password"
              value={passwordCheck}
              onChangeText={(text) => setPasswordCheck(text)}
            />
            <TouchableOpacity style={styles.button} onPress={onSignup}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                회원가입
              </Text>
            </TouchableOpacity>
            <View style={styles.findContainer}>
              <TouchableOpacity>
                <Text style={styles.findFactor}>ID 찾기</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.findFactor}>PW 찾기</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.findFactor}>로그인</Text>
              </TouchableOpacity>
            </View>
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
              onPress={onSignup}
              style={{
                backgroundColor: "#F4DF4A",
                borderRadius: 30,
                width: "80%",
                height: 45,

                marginBottom: 10,
                alignItems: "center",
              }}
            >
              <Text style={styles.socialBtn}>카카오로 시작하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSignup}
              style={{
                backgroundColor: "#5EC439",
                borderRadius: 30,
                width: "80%",
                height: 45,
                marginBottom: 10,
                alignItems: "center",
              }}
            >
              <Text style={styles.socialBtn}>네이버로 시작하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSignup}
              style={{
                backgroundColor: "white",
                borderColor: "black",
                borderWidth: 1,
                borderRadius: 30,
                width: "80%",
                height: 45,
                marginBottom: 30,
                alignItems: "center",
              }}
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
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
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
    fontSize: 12,
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
  findContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginHorizontal: "auto",
  },
  findFactor: {
    color: "gray",
    fontSize: 10,
    fontWeight: "semibold",
    marginBottom: 10,
  },
  decoLine: {
    width: "80%",
    justifyContent: "center",
    borderBottomColor: "#A8A8A8",
    borderBottomWidth: 1,
    marginTop: 10,
    marginBottom: 40,
    alignItems: "center",
    marginHorizontal: "auto",
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
});
