import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
import { useKakaoLogin } from "../../hooks/useKakaoLogin";
import { AuthContext } from "../../store/context";
import { colors } from "../../styles/colors";
import { fontSize, radius, spacing } from "../../styles/theme";
import { RootStackParamList } from "../../types/navigation";

type Props = RootStackParamList<"SignIn">;

// WebBrowser.maybeCompleteAuthSession();

// const redirectUri = AuthSession.makeRedirectUri({
//   useProxy: true,
// });
// console.log("redirectUri:", redirectUri);

export default function SignIn({ navigation }: Props) {
  const [userId, setUserId] = useState<string>("");
  const [userPw, setUserPw] = useState<string>("");
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext 없음");
  }
  const { setUser } = authContext;
  const { promptAsync, request } = useKakaoLogin({
    setUser,
    navigation,
  });

  //일반 로그인
  const login = async (): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, userId, userPw);
      const uid = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, "users", uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // setUser({
        //   uid,
        //   email: userData.email,
        //   displayName: userData.displayName,
        //   followerCnt: userData.followerCnt,
        //   followingCnt: userData.followingCnt,
        //   photoURL: userData.photoURL,
        //   createdAt: userData.createdAt,
        // } as CreateUserPayload);
        setUser(userCredential.user);
      }
      navigation.navigate("Bottom", { screen: "Home" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("오류", error.message);
      } else {
        Alert.alert("오류", "알 수 없는 오류");
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
        backgroundColor: colors.white,
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
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                value={userId}
                onChangeText={(text: string) => setUserId(text)}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={true}
                textContentType="password"
                value={userPw}
                onChangeText={(text: string) => setUserPw(text)}
              />
              <TouchableOpacity style={styles.button} onPress={login}>
                <Text style={{ color: colors.white }}>로그인</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.findContainer}>
            <TouchableOpacity onPress={() => navigation.navigate("AccFind")}>
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
                paddingHorizontal: spacing.lg,
                backgroundColor: colors.white,
                zIndex: spacing.xl,
                top: spacing.sm,
                color: colors.placeholder,
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
              onPress={() => promptAsync()}
              disabled={!request}
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
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    padding: spacing.sm,
  },
  button: {
    width: 300,
    height: 45,
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
    justifyContent: "center",
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
