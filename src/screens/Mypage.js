import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  Button,
  Alert,
  Pressable,
} from "react-native";
import LikeIcon from "../../src/assets/icons/heart.svg";
import BookMarkIcon from "../../src/assets/icons/bookmark.svg";
import ListIcon from "../../src/assets/icons/receipt.svg";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AlertIcon from "../assets/icons/alert.svg";
import SettingIcon from "../assets/icons/setting.svg";
import ShareIcon from "../assets/icons/share.svg";
import EditIcon from "../assets/icons/edit.svg";
import { AuthContext } from "../services/context";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function Mypage({ navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const [exampleNum, setExampleNum] = useState(7);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name);

  const showAlertWithChoices = () => {
    Alert.alert(
      "Choose an Option",
      "Please select one of the following:",
      [
        {
          text: "SNSshare",
          onPress: () => Alert.alert("Shared to SNS"),
        },
        {
          text: "LinkShare",
          onPress: () => Alert.alert("Link Copied"),
        },
        {
          text: "Cancel",
          onPress: () => "Cancel Pressed",
          style: "cancel",
        },
      ],
      { cancelable: false },
    );
  };

  const editProfile = async () => {
    try {
      setIsEditing(true);
      const userRef = doc(db, "users", user?.email);
      await updateDoc(userRef, {
        displayName: editedName,
      });
      setUser((prev) => ({
        ...prev,
        name: editedName,
      }));
      Alert.alert("프로필이 수정되었습니다");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("수정 실패", "다시 시도해주세요");
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        {/* <TouchableOpacity style={styles.container}> */}
        <View style={styles.container}>
          <View style={styles.settingContainer}>
            <TouchableOpacity>
              <AlertIcon width={24} height={24} />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 10 }}>
              <ShareIcon
                width={24}
                height={24}
                onPress={showAlertWithChoices}
              />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 10 }}>
              <SettingIcon
                width={24}
                height={24}
                fill={"#333"}
                onPress={() => navigation.navigate("Setting")}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.myInfoContainer}>
            <View style={styles.accContainer}>
              <View style={styles.imageContainer}>
                <ImageBackground
                  // source={ExampleImg}
                  source={require("../../src/assets/images/ex.jpg")}
                  style={styles.imageBackground}
                  imageStyle={styles.tumbnail}
                />
              </View>
              <View style={styles.myAccInfo}>
                <View style={styles.myFollowInfo}>
                  {isEditing ? (
                    <>
                      <TextInput
                        autoCapitalize="none"
                        keyboardType="editedName"
                        textContentType="editedName"
                        autoFocus={true}
                        value={editedName}
                        onChangeText={setEditedName}
                        style={{
                          backgroundColor: "#fff",
                          borderRadius: 6,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          minWidth: 120,
                        }}
                      />
                      <TouchableOpacity onPress={editProfile}>
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                          저장
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setIsEditing(false)}
                        setEditedName={user?.name}
                      >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                          취소
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: "#fff",
                          fontSize: 22,
                        }}
                      >
                        {user?.name}
                      </Text>
                      <TouchableOpacity onPress={() => setIsEditing(true)}>
                        <EditIcon width={20} height={20} fill="#fff" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                <View style={styles.myFollowInfo}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ marginRight: 10, color: "#fff" }}>
                      팔로워
                    </Text>
                    <Text style={{ fontWeight: "bold", color: "#fff" }}>
                      {user?.following}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ marginRight: 10, color: "#fff" }}>
                      팔로잉
                    </Text>
                    <Text style={{ fontWeight: "bold", color: "#fff" }}>
                      {user?.follower}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.myActivity}>
              <TouchableOpacity style={{ alignItems: "center" }}>
                <ListIcon width={36} height={36} fill="#fff" />
                <Text
                  style={{
                    marginTop: 15,
                    color: "#fff",
                    fontSize: "14",
                    fontWeight: "bold",
                  }}
                >
                  관람 내역
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  alignItems: "center",
                }}
              >
                <BookMarkIcon width={36} height={36} fill="#fff" />
                <Text
                  style={{
                    marginTop: 15,
                    color: "#fff",
                    fontSize: "14",
                    fontWeight: "bold",
                  }}
                >
                  스크랩북
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <LikeIcon width={36} height={36} fill="#fff" />
                <Text
                  style={{
                    marginTop: 15,
                    color: "#fff",
                    fontSize: "14",
                    fontWeight: "bold",
                  }}
                >
                  좋아요
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.reviewContainer}>
            <Text style={styles.reiewText}>나의 후기 목록</Text>
            <View style={styles.reviewTumbContainer}>
              {Array.from({ length: exampleNum }).map((_, idx) => (
                <ImageBackground
                  key={idx}
                  source={require("../../src/assets/images/ex.jpg")}
                  style={styles.reviewTumblnail}
                  imageStyle={styles.ReviewImage}
                  resizeMode="cover"
                />
              ))}
            </View>
          </View>
        </View>
        {!user.name ? (
          <>
            <Pressable
              onPress={() => navigation.navigate("Login")}
              style={({ pressed }) => [
                styles.loginBtnWrapper,
                pressed && styles.loginBtnPressedWrapper,
              ]}
            >
              {({ pressed }) => (
                <Text
                  style={[
                    styles.loginBtnText,
                    pressed && styles.loginBtnPressedText,
                  ]}
                >
                  로그인
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("Signup")}
              style={({ pressed }) => [
                styles.signupBtnWrapper,
                pressed && styles.signupBtnPressedWrapper,
              ]}
            >
              {({ pressed }) => (
                <Text
                  style={[
                    styles.signupBtnText,
                    pressed && styles.signupBtnPressedText,
                  ]}
                >
                  회원가입
                </Text>
              )}
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={() => setUser(null)}
            style={({ pressed }) => [
              styles.logoutBtnWrapper,
              pressed && styles.logoutBtnPressedWrapper,
            ]}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.logoutBtnText,
                  pressed && styles.logoutBtnPressedText,
                ]}
              >
                로그아웃
              </Text>
            )}
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    // borderColor: "yellow",
    // borderWidth: 5,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subTitle: {
    fontSize: 15,
    // fontWeight: "semibold",
    alignItems: "flex-start",
    paddingVertical: 10,
    marginRight: 10,
  },
  settingContainer: {
    width: "90%",
    justifyContent: "flex-end",
    flexDirection: "row",
    marginVertical: 20,
  },
  myInfoContainer: {
    width: "90%",
    height: "auto",
    borderColor: "#608D00",
    backgroundColor: "#608D00",
    borderWidth: 1,
    borderRadius: 20,
    flexDirection: "horizontal",
    alignItems: "left",
    padding: 15,
    marginVertical: 10,
    marginHorizontal: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
    overflow: "visible",
  },
  accContainer: {
    width: "100%",
    height: "auto",
    // borderColor: "red",
    // borderWidth: 3,
    // borderRadius: 10,
    padding: 10,
    justifyContent: "beetween",
    flexDirection: "row",
    alignItems: "center",
  },
  myAccInfo: {
    width: "70%",
    height: "auto",
    // borderColor: "orange",
    // borderWidth: 1,
    // borderRadius: 10,
    marginLeft: 5,
    justifyContent: "space-around",
    flexDirection: "horizontal",
  },

  myFollowInfo: {
    width: "90%",
    height: "auto",
    // backgroundColor: "skyblue",
    marginVertical: 10,
    padding: 3,
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  myActivity: {
    width: "100%",
    height: "auto",
    // borderColor: "blue",
    // borderWidth: 1,
    // borderRadius: 10,
    // backgroundColor: "gray",
    padding: 10,
    marginVertical: 10,
    justifyContent: "space-around",
    flexDirection: "row",
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  imageBackground: {
    width: 80,
    height: 80,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",

    // borderColor: "hotpink",
    // borderWidth: 3,
    overflow: "hidden",
  },
  tumbnail: {
    width: 80,
    height: 80,
    resizeMode: "cover",
  },
  reviewContainer: {
    width: "90%",
    height: "auto",
    marginVertical: 30,
    // backgroundColor: "pink",
    // borderWidth: 1,
  },
  reviewTumblnail: {
    width: 110,
    height: 130,
    borderColor: "black",
    borderwidth: 1,
    margin: 3,
  },
  ReviewImage: {
    borderRadius: 10,
  },
  reiewText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    marginLeft: 5,
  },
  reviewTumbContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loginBtnWrapper: {
    marginTop: 20,
    borderColor: "#608D00",
    borderWidth: 2,
    width: 300,
    height: 45,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: "auto",
    backgroundColor: "transparent",
  },
  loginBtnPressedWrapper: {
    backgroundColor: "#608D00",
  },
  loginBtnText: {
    textAlign: "center",
    lineHeight: 45,
    fontSize: 14,
    fontWeight: "bold",
    color: "#608D00",
  },
  loginBtnPressedText: {
    color: "#fff",
  },
  signupBtnWrapper: {
    marginTop: 10,
    marginBottom: 30,
    borderColor: "#608D00",
    borderWidth: 2,
    width: 300,
    height: 45,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: "auto",
    backgroundColor: "transparent",
  },
  signupBtnPressedWrapper: {
    backgroundColor: "#608D00",
  },
  signupBtnText: {
    textAlign: "center",
    lineHeight: 45,
    fontSize: 14,
    fontWeight: "bold",
    color: "#608D00",
  },
  signupBtnPressedText: {
    color: "#fff",
  },
  logoutBtnWrapper: {
    marginTop: 20,
    marginBottom: 30,
    borderColor: "#608D00",
    borderWidth: 2,
    width: 300,
    height: 45,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: "auto",
    backgroundColor: "#608D00",
  },
  logoutBtnPressedWrapper: {
    backgroundColor: "transparent",
  },
  logoutBtnText: {
    textAlign: "center",
    lineHeight: 45,
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  logoutBtnPressedText: {
    color: "#608D00",
  },
};
