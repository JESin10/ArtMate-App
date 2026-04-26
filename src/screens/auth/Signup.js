import * as ImagePicker from "expo-image-picker";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db, storage } from "../../../firebase";
import Mainlogo from "../../assets/icons/logo-main.svg";
import MainSlogun from "../../assets/images/slogan.svg";
import { colors } from "../../styles/colors";
import { fontSize, radius, spacing } from "../../styles/theme";

export default function Signup({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [isUser, setIsUser] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("안내", "사진 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const onCheckEmail = async (email) => {
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", email.trim().toLowerCase()),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert("안내", "이미 가입된 이메일입니다.");
        return false; // 중복
      } else {
        Alert.alert("안내", "가입 가능한 이메일입니다.");
        return true; // 사용 가능
      }
    } catch (error) {
      Alert.alert("오류", "이메일 확인에 실패했습니다.");
      return false;
    }
  };

  const onSignup = async () => {
    // 필수 입력 체크
    if (!email || !password || !passwordCheck || !name) {
      Alert.alert("안내", "모든 필드를 입력해주세요.");
      return;
    }

    // 비밀번호 조건 체크 (8자 이상, 문자+숫자+특수문자)
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+~`|}{[\]:;?><,./-]).{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "안내",
        "비밀번호는 8자 이상이며, 문자, 숫자, 특수문자를 포함해야 합니다.",
      );
      return;
    }

    // 비밀번호 확인
    if (password !== passwordCheck) {
      Alert.alert("안내", "비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 이미 가입된 이메일인지 체크
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        Alert.alert("안내", "이미 가입된 이메일입니다.");
        return;
      }

      // 회원가입 로직
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      let photoURL = null;
      if (profileImage) {
        const response = await fetch(profileImage);
        const blob = await response.blob();
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(storageRef, blob);
        photoURL = await getDownloadURL(storageRef);
      }

      await setDoc(doc(db, "users", user.uid), {
        displayName: name,
        email,
        uid: user.uid,
        createdAt: new Date().toUTCString(),
        followingCnt: 0,
        followerCnt: 0,
        photoURL,
      });

      Alert.alert("안내", "회원가입이 완료되었습니다.");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("오류", error.message || String(error));
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
            <TouchableOpacity onPress={pickImage} style={styles.profilePicker}>
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
              <Text style={{ color: colors.primary, marginTop: spacing.xs }}>
                프로필 사진 선택
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TextInput
                style={styles.EmailInput}
                placeholder="이메일"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoFocus={true}
                value={email}
                onChangeText={(text) => setEmail(text)}
              />
              <TouchableOpacity
                onPress={() => onCheckEmail(email)}
                style={styles.EmailCheckBtn}
              >
                <Text style={{ color: colors.white, fontSize: fontSize.sm }}>
                  확인
                </Text>
              </TouchableOpacity>
            </View>

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
              <Text style={{ color: colors.white, fontWeight: "bold" }}>
                회원가입
              </Text>
            </TouchableOpacity>
            <View style={styles.findContainer}>
              {/* <TouchableOpacity>
                <Text style={styles.findFactor}>ID 찾기</Text>
              </TouchableOpacity> */}
              <TouchableOpacity onPress={() => navigation.navigate("AccFind")}>
                <Text style={styles.findFactor}>PW 찾기</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
                <Text style={styles.findFactor}>로그인</Text>
              </TouchableOpacity>
            </View>
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
              onPress={onSignup}
              style={{
                backgroundColor: colors.kakao_yellow,
                borderRadius: radius.lg,
                width: "80%",
                height: 46,
                marginBottom: spacing.sm,
                alignItems: "center",
              }}
            >
              <Text style={styles.socialBtn}>카카오로 시작하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSignup}
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
              onPress={onSignup}
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
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
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
    placeholderTextColor: colors.placeholder,
    fontSize: fontSize.sm,
  },
  EmailInput: {
    width: 240,
    height: 45,
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    textAlign: "center",
    placeholderTextColor: colors.placeholder,
    fontSize: fontSize.sm,
    marginRight: spacing.sm,
  },
  EmailCheckBtn: {
    width: 50,
    height: 45,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
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
  findContainer: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginHorizontal: "auto",
  },
  findFactor: {
    color: colors.gray,
    fontSize: fontSize.sm,
    fontWeight: "semibold",
    marginBottom: spacing.sm,
  },
  decoLine: {
    width: "80%",
    justifyContent: "center",
    borderBottomColor: colors.gray,
    borderBottomWidth: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.exxl,
    alignItems: "center",
    marginHorizontal: "auto",
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
  profilePicker: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.lightGray,
  },
});
