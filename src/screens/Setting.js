import {
  View,
  Text,
  SafeAreaView,
  Button,
  BackHandler,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import React from "react";
import BackwardIcon from "../assets/icons/backward.svg";

export default function Setting({ navigation }) {
  return (
    <SafeAreaView>
      <View style={styles.settingFactorContainer}>
        <View style={styles.userSetting}>
          <TouchableOpacity
            style={{ margin: 8 }}
            onPress={() => navigation.goBack()}
          >
            <BackwardIcon width={24} height={24} fill="#fff" />
          </TouchableOpacity>
          <Text style={styles.userSettingFactor}>가입정보 확인</Text>
          <Text style={styles.userSettingFactor}>비밀번호 변경</Text>
          <Text style={styles.userSettingFactor}>소셜 로그인 연동</Text>
          <Text style={styles.userSettingFactor}>최근 본 콘텐츠</Text>
          <Text style={styles.userSettingFactor}>이벤트 참여 현황</Text>
        </View>
        <View style={styles.QASetting}>
          <Text style={styles.QAFactor}>공지사항</Text>
          <Text style={styles.QAFactor}>FAQ</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "서비스이용약관",
                "제1조(목적) 이 약관은 OO 회사(전자상거래 사업자)가 운영하는 OO 사이버 몰(이하 “몰”이라 한다)에서 제공하는 인터넷 관련 서비스(이하 “서비스”라 한다)를 이용함에 있어 사이버 몰과 이용자의 권리․의무 및 책임사항을 규정함을 목적으로 합니다.※「PC통신, 무선 등을 이용하는 전자상거래에 대해서도 그 성질에 반하지 않는 한 이 약관을 준용합니다.」"
              );
            }}
          >
            <Text style={styles.QAFactor}>서비스이용약관</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "개인정보처리방침",
                "제1조(목적) 이 지침은 「개인정보 보호법」 제12조제1항에 따른 개인정보의 처리에 관한 기준, 개인정보 침해의 유형 및 예방조치 등에 관한 세부적인 사항을 규정함을 목적으로 한다."
              );
            }}
          >
            <Text style={styles.QAFactor}>개인정보처리방침</Text>
          </TouchableOpacity>
          <Text style={styles.QAFactor}>의견보내기</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Version", "Ver0.0.1");
            }}
          >
            <Text style={styles.QAFactor}>버전정보</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.QASetting}>
          <Text style={styles.QAFactor}>로그아웃</Text>
          <Text style={styles.QAFactor}>서비스 탈퇴</Text>
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
    borderWidth: 3,
    borderColor: "blue",
  },
  BackBtn: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    margin: 10,
    color: "white",
    fontSize: 24,
  },
  userSetting: {
    width: "100%",
    // height: "40%",
    flexDirection: "horizontal",
    // paddingTop: 40,
    paddingBottom: 0,
    backgroundColor: "#608D00",
    borderWidth: 2,
    borderColor: "red",
  },
  userSettingFactor: {
    backgroundColor: "#fff",
    padding: 10,
    borderWidth: 1,
    borderColor: "black",
  },
  QASetting: {
    width: "100%",
    // height: "40%",
    flexDirection: "horizontal",
    justyfyContent: "center",
    verticalAlign: "center",
    paddingTop: 40,
    paddingBottom: 0,
    backgroundColor: "#608D00",
    borderWidth: 2,
    borderColor: "yellow",
  },
  QAFactor: {
    backgroundColor: "#E3E3E3",
    padding: 10,
    borderWidth: 1,
    borderColor: "black",
  },
});
