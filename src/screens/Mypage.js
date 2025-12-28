import React, { useState } from "react";
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
} from "react-native";
import LikeIcon from "../../src/assets/icons/heart.svg";
import BookMarkIcon from "../../src/assets/icons/bookmark.svg";
import ListIcon from "../../src/assets/icons/receipt.svg";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AlertIcon from "../assets/icons/alert.svg";
import SettingIcon from "../assets/icons/setting.svg";
import ShareIcon from "../assets/icons/share.svg";
import EditIcon from "../assets/icons/edit.svg";

export default function Mypage({ navigation }) {
  const [exampleNum, setExampleNum] = useState(7);
  // const Stack = createNativeStackNavigator();
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
      { cancelable: false }
    );
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
                onPress={() => navigation.navigate("Setting")}              />
            </TouchableOpacity>
          </View>

          <View style={styles.myInfoContainer}>
            <View style={styles.accContainer}>
              <ImageBackground
                // source={ExampleImg}
                source={require("../../src/assets/images/ex.jpg")}
                style={styles.imageBackground}
                imageStyle={styles.tumbnail}
              />
              <View style={styles.myAccInfo}>
                <View style={styles.myFollowInfo}>
                  <Text>이름</Text>
                  <TouchableOpacity>
                    <EditIcon width={16} height={16} fill="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.myFollowInfo}>
                  <View>
                    <Text>팔로워</Text>
                    <Text>00명</Text>
                  </View>
                  <View>
                    <Text>팔로잉</Text>
                    <Text>ㅁㅁ명</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.myActivity}>
              <TouchableOpacity style={{ alignItems: "center" }}>
                <ListIcon width={36} height={36} fill="#fff" />
                <Text
                  style={{ marginTop: "15", color: "#fff", fontSize: "14" }}
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
                    marginTop: "15",
                    color: "#fff",
                    fontSize: "14",
                  }}
                >
                  스크랩북
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <LikeIcon width={36} height={36} fill="#fff" />
                <Text
                  style={{
                    marginTop: "15",
                    color: "#fff",
                    fontSize: "14",
                  }}
                >
                  좋아요
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.reviewContainer}>
            <Text>나의 후기 목록</Text>
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
        <TouchableOpacity
                    onPress={() => navigation.navigate("Signup")}
>
          <Text
            style={{ margin: 15, alignContent: "center" }}
          >
            회원가입
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    borderColor: "yellow",
    borderWidth: 5,
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
  },
  myInfoContainer: {
    width: "90%",
    height: "auto",
    borderColor: "green",
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "horizontal",
    alignItems: "left",
    padding: 10,
    marginVertical: 10,
    marginHorizontal: "auto",
  },
  accContainer: {
    width: "100%",
    height: "auto",
    borderColor: "red",
    borderWidth: 3,
    borderRadius: 10,
    padding: 10,
    justifyContent: "beetween",
    flexDirection: "row",
    alignItems: "center",
  },
  myAccInfo: {
    width: "70%",
    height: "auto",
    borderColor: "orange",
    borderWidth: 1,
    borderRadius: 10,
    marginLeft: 5,
    justifyContent: "space-around",
    flexDirection: "horizontal",
  },

  myFollowInfo: {
    width: "90%",
    height: "auto",
    backgroundColor: "skyblue",
    marginVertical: 10,
    padding: 3,
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
  },
  myActivity: {
    width: "100%",
    height: "auto",
    borderColor: "blue",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "gray",
    marginVertical: 10,
    justifyContent: "space-around",
    flexDirection: "row",
  },
  imageBackground: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderColor: "hotpink",
    borderWidth: 3,
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
    backgroundColor: "pink",
    marginVertical: 30,
    borderWidth: 1,
  },
  reviewTumblnail: {
    width: 100,
    height: 120,
    borderColor: "black",
    borderwidth: 1,
    margin: 3,
  },
  ReviewImage: {
    borderRadius: 10,
  },
  reviewTumbContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
};
