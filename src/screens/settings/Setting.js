import { deleteUser, sendPasswordResetEmail, signOut } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useContext } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../../firebase";
import BackwardIcon from "../../assets/icons/backward.svg";
import Mainlogo from "../../assets/icons/logo-main.svg";
import MainSlogun from "../../assets/images/slogan.svg";
import { AuthContext } from "../../store/context";
import { colors } from "../../styles/colors";

export default function Setting({ navigation }) {
  const { user, setUser } = useContext(AuthContext);

  const userInfoCheck = async () => {
    // 문자열을 Date 객체로 변환
    const dateObj = new Date(user.createdAt);

    // 연도, 월, 일 추출
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1; // JS는 0~11월이라 +1 필요
    const day = dateObj.getDate();

    //  원하는 형식으로 문자열 만들기
    const formatted = `${year}년 ${month}월 ${day}일 가입`;
    alert(formatted);
  };

  //비밀번호 찾기
  const findPassword = async () => {
    try {
      // Firebase Auth에서 비밀번호 재설정 이메일 발송
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert("안내", "입력한 이메일로 비밀번호 재설정 링크를 보냈습니다.");
    } catch (error) {
      Alert.alert("오류", "오류가 발생했습니다.");
    }
  };

  //로그아웃
  const userLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigation.navigate("Bottom", { screen: "Home" });
    } catch (error) {
      Alert.alert("오류", "로그아웃에 실패했습니다.");
    }
  };

  // Firestore 데이터 삭제
  const deleteUserData = async (uid) => {
    try {
      const subCollections = [
        "followers",
        "following",
        "comments",
        "likedReview",
        "bookmarks",
      ];

      //  1. 하위 컬렉션 먼저 삭제
      for (const col of subCollections) {
        const snap = await getDocs(collection(db, "users", uid, col));
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(db, "users", uid, col, docSnap.id));
        }
      }

      // 2. 마지막에 유저 doc 삭제
      await deleteDoc(doc(db, "users", uid));

      console.log("DB의 유저 데이터가 삭제되었습니다.");
    } catch (error) {
      console.error("Firestore 삭제 실패:", error);
    }
  };

  // 탈퇴
  const deleteAccount = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert("안내", "유저 정보를 찾을 수 없습니다.");
        return;
      }

      // 1. Firestore 삭제
      await deleteUserData(currentUser.uid);

      // 2. Auth 삭제 (이 순간 로그아웃 상태 됨)
      await deleteUser(currentUser);

      console.log("계정이 삭제되었습니다.");

      // 3. 상태 정리
      setUser(null);

      navigation.navigate("Bottom", { screen: "Home" });
    } catch (error) {
      console.error("계정 삭제 실패:", error);

      if (error.code === "auth/requires-recent-login") {
        Alert.alert("안내", "보안을 위해 다시 로그인 후 시도해주세요.");
      } else {
        Alert.alert("오류", "계정 삭제 실패");
      }
    }
  };

  return (
    <SafeAreaView>
      <TouchableOpacity
        onPress={() => navigation.navigate("Bottom", { screen: "Home" })}
        style={{ alignItems: "center", marginBottom: 30 }}
      >
        <Mainlogo width={200} height={100} />
        <MainSlogun width={180} height={30} />
      </TouchableOpacity>
      <View style={styles.settingFactorContainer}>
        <View style={styles.userSetting}>
          <TouchableOpacity
            style={{
              margin: 8,
            }}
            onPress={() => navigation.goBack()}
          >
            <BackwardIcon width={24} height={24} fill="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={userInfoCheck}>
            <Text
              style={{
                backgroundColor: "#fff",
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#d9d9d9",
              }}
            >
              가입정보 확인
            </Text>
          </TouchableOpacity>
          <Text style={styles.userSettingFactor} onPress={() => findPassword()}>
            비밀번호 변경
          </Text>
          <Text style={styles.userSettingFactor}>소셜 로그인 연동</Text>
          <Text style={styles.userSettingFactor}>최근 본 콘텐츠</Text>
          <Text style={styles.userSettingFactor}>이벤트 참여 현황</Text>
        </View>
        <View style={styles.QASetting}>
          <Text
            style={{
              backgroundColor: "#fff",
              padding: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#d9d9d9",
            }}
          >
            공지사항
          </Text>
          <Text style={styles.QAFactor}>FAQ</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "서비스이용약관",
                "제1조(목적) 이 약관은 OO 회사(전자상거래 사업자)가 운영하는 OO 사이버 몰(이하 “몰”이라 한다)에서 제공하는 인터넷 관련 서비스(이하 “서비스”라 한다)를 이용함에 있어 사이버 몰과 이용자의 권리․의무 및 책임사항을 규정함을 목적으로 합니다.※「PC통신, 무선 등을 이용하는 전자상거래에 대해서도 그 성질에 반하지 않는 한 이 약관을 준용합니다.」",
              );
            }}
          >
            <Text style={styles.QAFactor}>서비스이용약관</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "개인정보처리방침",
                "제1조(목적) 이 지침은 「개인정보 보호법」 제12조제1항에 따른 개인정보의 처리에 관한 기준, 개인정보 침해의 유형 및 예방조치 등에 관한 세부적인 사항을 규정함을 목적으로 한다.",
              );
            }}
          >
            <Text style={styles.QAFactor}>개인정보처리방침</Text>
          </TouchableOpacity>
          <Text style={styles.QAFactor}>의견보내기</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Version", "Ver1.0.5");
            }}
          >
            <Text style={styles.QAFactor}>버전정보</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.QASetting}>
          <TouchableOpacity
            onPress={userLogout}
            style={{
              backgroundColor: "#fff",
              padding: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#d9d9d9",
            }}
          >
            <Text>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={deleteAccount}>
            <Text style={styles.QAFactor}>서비스 탈퇴</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  settingFactorContainer: {
    flexDirection: "horizontal",
    width: "100%",
    height: "100%",
  },
  userSetting: {
    width: "100%",
    // height: "40%",
    flexDirection: "horizontal",
    // paddingTop: 40,
    paddingBottom: 0,
    backgroundColor: colors.primary,
  },
  userSettingFactor: {
    backgroundColor: colors.white,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  QASetting: {
    width: "100%",
    flexDirection: "horizontal",
    justyfyContent: "center",
    verticalAlign: "center",
    paddingTop: 40,
    paddingBottom: 0,
    backgroundColor: colors.primary,
  },
  QAFactor: {
    backgroundColor: colors.white,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
});
