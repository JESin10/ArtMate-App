import * as ImagePicker from "expo-image-picker";
import { signOut } from "firebase/auth";
import {
  collection,
  collectionGroup,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { auth, db, storage } from "../../../firebase";
import AlertIcon from "../../assets/icons/alert.svg";
import BookMarkIcon from "../../assets/icons/bookmark.svg";
import EditIcon from "../../assets/icons/edit.svg";
import LikeIcon from "../../assets/icons/heart.svg";
import ListIcon from "../../assets/icons/receipt.svg";
import SettingIcon from "../../assets/icons/setting.svg";
import ShareIcon from "../../assets/icons/share.svg";
import NotificationModal from "../../components/notify/NotificationModal";
import { AuthContext } from "../../store/context";
import { useUserStore } from "../../store/useUserStore";
import { colors } from "../../styles/colors";

export default function Mypage({ navigation }) {
  const {
    followingMap,
    followerMap,
    setFollowerMap,
    setFollowingMap,
    myReviews,
    myComments,
    unreadCount,
    setMyReviews,
    setMyComments,
    setUnreadCount,
    clearUserStore,
    myLikeRV,
    setMyLikeRV,
    setMyBookmarks,
    setMyPins,
  } = useUserStore();
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || "");
  const [profileImage, setProfileImage] = useState(null);
  const followerCnt = Object.keys(followerMap || {}).length;
  const followingCnt = Object.keys(followingMap || {}).length;
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const isFirstLoad = useRef(true);

  //프로필 이미지
  useEffect(() => {
    if (user?.photoURL) {
      setProfileImage(user.photoURL);
    }
  }, [user?.photoURL]);

  //북마크 구독
  useEffect(() => {
    if (!user?.uid) return;

    const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
    const q = query(bookmarksRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMyBookmarks(data);
    });

    return () => unsub();
  }, [user?.uid]);

  //핀 구독
  useEffect(() => {
    if (!user?.uid) return;

    // Firestore 컬렉션 실시간 구독
    const pinsRef = collection(db, "users", user.uid, "pins");
    const b = query(pinsRef, orderBy("createdAt", "desc")); // 최신순 정렬

    const unsubscribe = onSnapshot(
      b,
      (snapshot) => {
        const pinData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMyPins(pinData);
      },
      (error) => {
        console.error("실시간 구독 에러:", error);
      },
    );

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, [user?.uid]);

  //팔로잉 팔로워 구독
  useEffect(() => {
    if (!user) return;

    // 팔로워 구독
    const followersRef = collection(db, "users", user.uid, "followers");
    const unsubscribeFollowers = onSnapshot(followersRef, (snapshot) => {
      const follower = {};
      // 컬렉션 문서 개수 = 팔로워 수
      snapshot.docs.forEach((doc) => {
        follower[doc.id] = true;
      });
      setFollowerMap(follower);
    });

    // 팔로잉 구독
    const followingRef = collection(db, "users", user.uid, "following");
    const unsubscribeFollowing = onSnapshot(followingRef, (snapshot) => {
      const following = {};
      snapshot.docs.forEach((doc) => {
        following[doc.id] = true;
      });
      setFollowingMap(following);
    });

    // 언마운트 시 구독 해제
    return () => {
      unsubscribeFollowers();
      unsubscribeFollowing();
    };
  }, [user, setFollowerMap, setFollowingMap]);

  //리뷰, 좋아요, 댓글 실시간 구독
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "reviews"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    const l = query(
      collection(db, "users", user.uid, "likedReview"),
      orderBy("createdAt", "desc"),
    );
    const c = query(
      collectionGroup(db, "comments"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyReviews(data);
    });
    const L_unsubscribe = onSnapshot(l, (snapshot) => {
      const l_data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyLikeRV(l_data);
    });
    const C_unsubscribe = onSnapshot(c, (snapshot) => {
      const c_data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyComments(c_data);
    });

    return () => {
      unsubscribe();
      L_unsubscribe();
      C_unsubscribe();
    };
  }, [user, setFollowerMap, setFollowingMap]);

  //알림 구독
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // 새로 추가된 문서만 감지
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newItem = change.doc.data();

          // 최초 로딩에서는 토스트 안 띄움
          if (!isFirstLoad.current) {
            showNotification(newItem);
          }
        }
      });

      const unread = snapshot.docs.filter((doc) => !doc.data().isRead).length;
      setUnreadCount(unread);

      isFirstLoad.current = false;
    });

    return unsubscribe;
  }, [user]);

  const showAlertWithChoices = () => {
    Alert.alert(
      "안내",
      "공유 방법을 선택해주세요",
      [
        {
          text: "SNSshare",
          onPress: () => Alert.alert("안내", "SNS에 공유되었습니다."),
        },
        {
          text: "LinkShare",
          onPress: () => Alert.alert("안내", "링크가 복사되었습니다."),
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

  //프로필 수정
  const editProfile = async (editedName, profileImage) => {
    try {
      setIsEditing(true);
      const userRef = doc(db, "users", user?.uid);
      await updateDoc(userRef, {
        displayName: editedName,
        photoURL: profileImage,
      });
      setUser((prev) => ({
        ...prev,
        displayName: editedName,
        photoURL: profileImage,
      }));
      Alert.alert("안내", "프로필이 수정되었습니다");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("오류", "프로필 수정에 실패하였습니다");
    }
  };

  //로그아웃
  const userLogout = async () => {
    try {
      await signOut(auth);
      clearUserStore();
      setUser(null);
      navigation.navigate("Bottom", { screen: "Home" });
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const pickImage = async () => {
    // 권한 요청
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("안내", "사진 접근 권한이 필요합니다.");
      return;
    }

    // 이미지 선택
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      setProfileImage(localUri);

      // Firebase Storage에 업로드
      const response = await fetch(localUri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, blob);

      // 다운로드 URL 가져오기
      const downloadURL = await getDownloadURL(storageRef);

      // Firestore에 저장
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { photoURL: downloadURL });

      // Context에도 반영
      setUser((prev) => ({ ...prev, photoURL: downloadURL }));
    }
  };

  //알림 보여주기
  const showNotification = (item) => {
    if (item.type === "like") {
      Toast.show({
        type: "info",
        text1: "❤️ 좋아요",
        text2: `${item.fromUserName}님이 회원님의 글을 좋아합니다`,
        position: "top",
      });
    }

    if (item.type === "follow") {
      Toast.show({
        type: "info",
        text1: "👤 팔로우",
        text2: `${item.fromUserName}님이 회원님을 팔로우했습니다`,
        position: "top",
      });
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        {/* <TouchableOpacity style={styles.container}> */}
        <View style={styles.container}>
          <View style={styles.settingContainer}>
            {/* <TouchableOpacity onPress={() => navigation.navigate("Notify")}>
              <AlertIcon width={24} height={24} />
            </TouchableOpacity> */}
            <TouchableOpacity onPress={() => setShowNotificationModal(true)}>
              <View style={{ position: "relative" }}>
                <AlertIcon width={24} height={24} />

                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
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
              <View>
                {isEditing ? (
                  <View style={styles.myAccInfo}>
                    <View style={styles.imageContainer}>
                      <TouchableOpacity onPress={pickImage}>
                        <ImageBackground
                          source={
                            profileImage
                              ? { uri: profileImage }
                              : require("../../assets/images/ex.jpg")
                          }
                          style={styles.imageBackground}
                          imageStyle={styles.tumbnail}
                        />
                      </TouchableOpacity>
                    </View>
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
                        fontSize: 20,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => editProfile(editedName, profileImage)}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        저장
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditedName(user?.displayName || "");
                        setIsEditing(false);
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        취소
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.myAccInfo}>
                    <View style={styles.imageContainer}>
                      <ImageBackground
                        source={
                          profileImage
                            ? { uri: profileImage }
                            : require("../../assets/images/ex.jpg")
                        }
                        style={styles.imageBackground}
                        imageStyle={styles.tumbnail}
                      />
                    </View>
                    <View
                      style={{
                        width: "60%",
                        flexDirection: "row",
                        justifyContent: "space-around",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: "#fff",
                          fontSize: 22,
                          minWidth: 120,
                        }}
                      >
                        {user?.displayName}
                      </Text>

                      <TouchableOpacity onPress={() => setIsEditing(true)}>
                        <EditIcon width={20} height={20} fill="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.myFollowInfo}>
                  <TouchableOpacity
                    style={{ flexDirection: "row" }}
                    onPress={() =>
                      navigation.navigate("FollowList", { tab: "followers" })
                    }
                  >
                    <Text style={{ marginRight: 10, color: "#fff" }}>
                      팔로워
                    </Text>
                    <Text style={{ fontWeight: "bold", color: "#fff" }}>
                      {followerCnt}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("FollowList", { tab: "followings" })
                    }
                    style={{ flexDirection: "row" }}
                  >
                    <Text style={{ marginRight: 10, color: "#fff" }}>
                      팔로잉
                    </Text>
                    <Text style={{ fontWeight: "bold", color: "#fff" }}>
                      {followingCnt}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.myActivity}>
              <TouchableOpacity
                style={{ alignItems: "center" }}
                onPress={() => navigation.navigate("History")}
              >
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
                onPress={() => {
                  navigation.navigate("Bookmarks");
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
              <TouchableOpacity onPress={() => navigation.navigate("Likes")}>
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
              {/* {myReviews.map((item, index) => (
                <ImageBackground
                  key={index}
                  source={{ uri: item.images[0] }}
                  style={styles.reviewTumblnail}
                  imageStyle={styles.ReviewImage}
                  resizeMode="cover"
                />
              ))} */}
              {myReviews.length === 0 ? (
                <View
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: 20,
                    marginVertical: 20,
                  }}
                >
                  <Text style={{ textAlign: "center", color: "#828282" }}>
                    등록된 후기가 없습니다
                  </Text>
                </View>
              ) : (
                myReviews.map((item, index) => (
                  <ImageBackground
                    key={index}
                    source={{ uri: item.images[0] }}
                    style={styles.reviewTumblnail}
                    imageStyle={styles.ReviewImage}
                    resizeMode="cover"
                  />
                ))
              )}
            </View>
          </View>
        </View>
        {!user.email ? (
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
            onPress={userLogout}
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
      <NotificationModal
        visible={showNotificationModal}
        onClose={() => {
          setShowNotificationModal(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    color: colors.text,
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
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderRadius: 20,
    flexDirection: "horizontal",
    alignItems: "left",
    padding: 15,
    marginVertical: 10,
    marginHorizontal: "auto",
    shadowColor: colors.black,
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
    overflow: "visible",
  },
  accContainer: {
    width: "100%",
    height: "auto",
    padding: 10,
    justifyContent: "beetween",
    flexDirection: "row",
    alignItems: "center",
  },
  myAccInfo: {
    width: "100%",
    height: "auto",
    marginBottom: 15,
    marginLeft: 5,
    justifyContent: "space-around",
    flexDirection: "row",
    alignItems: "center",
  },

  myFollowInfo: {
    width: "100%",
    height: "auto",
    marginVertical: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    shadowColor: colors.black,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  myActivity: {
    width: "100%",
    height: "auto",
    padding: 10,
    marginVertical: 10,
    justifyContent: "space-around",
    flexDirection: "row",
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 100,
    shadowColor: colors.black,
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
  },
  reviewTumblnail: {
    width: 110,
    height: 130,
    borderColor: colors.black,
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
    justifyContent: "flex-start",
    alignItems: "center",
  },
  loginBtnWrapper: {
    marginTop: 20,
    borderColor: colors.primary,
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
    backgroundColor: colors.primary,
  },
  loginBtnText: {
    textAlign: "center",
    lineHeight: 45,
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
  },
  loginBtnPressedText: {
    color: colors.white,
  },
  signupBtnWrapper: {
    marginTop: 10,
    marginBottom: 30,
    borderColor: colors.primary,
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
    backgroundColor: colors.primary,
  },
  signupBtnText: {
    textAlign: "center",
    lineHeight: 45,
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
  },
  signupBtnPressedText: {
    color: colors.white,
  },
  logoutBtnWrapper: {
    marginTop: 20,
    marginBottom: 30,
    borderColor: colors.primary,
    borderWidth: 2,
    width: 300,
    height: 45,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: "auto",
    backgroundColor: colors.primary,
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
    color: colors.primary,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: colors.red,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
});
