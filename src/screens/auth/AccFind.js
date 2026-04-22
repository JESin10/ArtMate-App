import { sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useContext, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../../firebase";
import Mainlogo from "../../assets/icons/logo-main.svg";
import MainSlogun from "../../assets/images/slogan.svg";
import { AuthContext } from "../../store/context";
import { colors } from "../../styles/colors";

export default function AccFind({ navigation }) {
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [userName, setUserName] = useState("");
  const { setUser } = useContext(AuthContext);

  const findPassword = async () => {
    if (!userId) {
      Alert.alert("입력 오류", "비밀번호를 찾을 이메일을 입력해주세요.");
      return;
    }

    try {
      // Firestore에서 해당 이메일 확인
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("찾기 실패", "등록되지 않은 이메일입니다.");
        return;
      }

      // Firebase Auth에서 비밀번호 재설정 이메일 발송
      await sendPasswordResetEmail(auth, userId);
      Alert.alert(
        "비밀번호 재설정",
        "입력한 이메일로 비밀번호 재설정 링크를 보냈습니다.",
      );
    } catch (error) {
      console.error("비밀번호 재설정 오류:", error);
      Alert.alert("오류", error.message || "오류가 발생했습니다.");
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
              {/* <TextInput
                  style={styles.input}
                  placeholder="비밀번호"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={true}
                  textContentType="password"
                  value={userPw}
                  onChangeText={(text) => setUserPw(text)}
                /> */}
              <TouchableOpacity style={styles.button} onPress={findPassword}>
                <Text style={{ color: "#fff" }}>비밀번호 찾기</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.findContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.findFactor}>로그인</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.findFactor}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ width: "95%" }}>
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
                // onPress={login}
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
                // onPress={login}
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
                // onPress={login}
              >
                <Text style={styles.socialBtn}>구글로 시작하기</Text>
              </TouchableOpacity>
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
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: 300,
    height: 45,
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 30,
    padding: 10,
    marginBottom: 10,
    textAlign: "center",
    placeholderTextColor: colors.placeholder,
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
    backgroundColor: colors.primary,
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
    borderBottomColor: colors.gray,
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
