import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import Mainlogo from "../assets/icons/logo-main.svg";
import MainSlogun from "../assets/images/slogan.svg";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UserSignup({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [isUser, setIsUser] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("사진 접근 권한이 필요합니다.");
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

  const onSignup = async () => {
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

      let photoURL = null;
      if (profileImage) {
        const response = await fetch(profileImage);
        const blob = await response.blob();
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(storageRef, blob);
        photoURL = await getDownloadURL(storageRef);
      }

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        displayName: name,
        email,
        uid: user.uid,
        createdAt: new Date().toUTCString(),
        followingCnt: 0,
        followerCnt: 0,
        photoURL, // 프로필 사진 URL 저장
      });

      Alert.alert("회원가입 성공", "회원가입이 완료되었습니다.");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("회원가입 실패", error.message || String(error));
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
              <Text style={{ color: "#608D00", marginTop: 5 }}>
                프로필 사진 선택
              </Text>
            </TouchableOpacity>
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
  profilePicker: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eee",
  },
});
