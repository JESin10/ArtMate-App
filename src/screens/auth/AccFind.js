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
import { fontSize, radius, spacing } from "../../styles/theme";

export default function AccFind({ navigation }) {
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [userName, setUserName] = useState("");
  const { setUser } = useContext(AuthContext);

  const findPassword = async () => {
    if (!userId) {
      Alert.alert("안내", "비밀번호를 찾을 이메일을 입력해주세요.");
      return;
    }

    try {
      // Firestore에서 해당 이메일 확인
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("안내", "등록되지 않은 이메일입니다.");
        return;
      }

      // Firebase Auth에서 비밀번호 재설정 이메일 발송
      await sendPasswordResetEmail(auth, userId);
      Alert.alert("안내", "입력한 이메일로 비밀번호 재설정 링크를 보냈습니다.");
    } catch (error) {
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
              <TouchableOpacity style={styles.button} onPress={findPassword}>
                <Text style={{ color: colors.white }}>비밀번호 찾기</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.findContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
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
                  paddingHorizontal: spacing.lg,
                  backgroundColor: colors.white,
                  zIndex: spacing.xl,
                  top: spacing.sm,
                  color: colors.lightGray,
                  fontSize: fontSize.sm,
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
                  backgroundColor: colors.kakao_yellow,
                  borderRadius: radius.lg,
                  width: "80%",
                  height: 46,
                  marginBottom: spacing.sm,
                  alignItems: "center",
                }}
                // onPress={login}
              >
                <Text style={styles.socialBtn}>카카오로 시작하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.naver_green,
                  borderRadius: radius.lg,
                  width: "80%",
                  height: 46,
                  marginBottom: spacing.sm,
                  alignItems: "center",
                }}
              >
                <Text style={styles.socialBtn}>네이버로 시작하기</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.black,
                  borderWidth: 1,
                  borderRadius: radius.lg,
                  width: "80%",
                  height: 46,
                  marginBottom: spacing.sm,
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
    height: 46,
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    textAlign: "center",
    placeholderTextColor: colors.placeholder,
  },
  inputContainer: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    padding: spacing.sm,
  },
  button: {
    width: 300,
    height: 46,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    margin: spacing.sm,
    alignItems: "center",
    padding: spacing.lg,
  },
  socialBtn: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    lineHeight: 46,
    fontSize: fontSize.sm,
    fontWeight: "bold",
    alignItems: "center",
    flexDirection: "center",
  },
  decoLine: {
    width: "80%",
    justifyContent: "center",
    borderBottomColor: colors.gray,
    borderBottomWidth: 1,
    marginTop: spacing.xxxl,
    marginBottom: spacing.exxl,
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
    color: colors.gray,
    fontSize: fontSize.sm,
    fontWeight: "semibold",
    marginBottom: spacing.xl,
  },
});
