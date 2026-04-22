import {
  collection,
  doc,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import {
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../../firebase";
import BackwardIcon from "../../assets/icons/backward.svg";
import Mainlogo from "../../assets/icons/logo-main.svg";
import SearchBar from "../../components/search/SearchBar";
import { FollowUser } from "../../services/followService";
import { AuthContext } from "../../store/context";
import { useUserStore } from "../../store/useUserStore";
import { colors } from "../../styles/colors";

export default function Profile({ route, navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const { followingMap, setFollowingMap, setFollowerMap } = useUserStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [review, setReview] = useState([]);
  const { userId } = route.params;
  const allImages = review.flatMap((r) => r.images || []);
  const reviewPreview = review.map((r) => ({
    image: r.images?.[0],
    title: r.title,
  }));
  const visibleImages = showAllImages ? allImages : allImages.slice(0, 6);
  const now = Timestamp.now();
  const expireAt = Timestamp.fromMillis(
    now.toMillis() + 7 * 24 * 60 * 60 * 1000,
  );

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
  }, [user]);

  //유저프로필 정보 구독
  useEffect(() => {
    if (!userId) return;

    const userDocRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setSelectedUser({
          id: docSnap.id,
          ...docSnap.data(),
        });
      } else {
        console.log("❌ 유저 없음");
      }
    });

    return () => unsubscribe();
  }, [userId]);

  //유저리뷰
  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, "reviews"), where("userId", "==", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReview(reviews);
    });

    return () => unsubscribe();
  }, [userId]);

  // 팔로우, 언팔로우
  // const FollowUser = async (targetUser) => {
  //   if (!user) {
  //     Alert.alert("로그인이 필요합니다.");
  //     return;
  //   }

  //   const targetUserId = targetUser.uid;

  //   const followingRef = doc(db, "users", user.uid, "following", targetUserId);
  //   const followerRef = doc(db, "users", targetUserId, "followers", user.uid);

  //   try {
  //     if (followingMap[targetUserId]) {
  //       // 언팔로우
  //       await deleteDoc(followingRef);
  //       await deleteDoc(followerRef);
  //       await deleteFollowNotification(targetUserId);
  //       await updateDoc(doc(db, "users", user.uid), {
  //         followingCnt: increment(-1),
  //       });
  //       await updateDoc(doc(db, "users", targetUserId), {
  //         followerCnt: increment(-1),
  //       });
  //     } else {
  //       // 팔로우
  //       await setDoc(followingRef, {
  //         displayName: targetUser.displayName,
  //         photoURL: targetUser.photoURL || null,
  //         createdAt: serverTimestamp(),
  //       });
  //       await setDoc(followerRef, {
  //         displayName: user.displayName,
  //         photoURL: user.photoURL || null,
  //         createdAt: serverTimestamp(),
  //       });
  //       await updateDoc(doc(db, "users", user.uid), {
  //         followingCnt: increment(1),
  //       });
  //       await updateDoc(doc(db, "users", targetUserId), {
  //         followerCnt: increment(1),
  //       });

  //       //상대에게 팔로우 알림
  //       if (user.uid !== targetUserId) {
  //         await addDoc(collection(db, "users", targetUserId, "notifications"), {
  //           type: "follow",
  //           fromUserId: user.uid,
  //           fromUserName: user.displayName,
  //           fromUserPhoto: user.photoURL,
  //           createdAt: serverTimestamp(),
  //           expireAt: expireAt,
  //           isRead: false,
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error("팔로우 토글 실패:", error);
  //     Alert.alert("팔로우/언팔로우 실패. 다시 시도해주세요.");
  //   }
  // };

  //언팔로우시 알림 삭제
  // const deleteFollowNotification = async (targetUserId) => {
  //   const q = query(
  //     collection(db, "users", targetUserId, "notifications"),
  //     where("type", "==", "follow"),
  //     where("fromUserId", "==", user.uid),
  //   );

  //   const snapshot = await getDocs(q);

  //   snapshot.forEach(async (docSnap) => {
  //     await deleteDoc(docSnap.ref);
  //   });
  // };

  return (
    <ScrollView
      style={{
        width: "95%",
        marginHorizontal: "auto",
        flexDirection: "column",
        flex: 1,
        position: "relative",
        paddingBottom: 60,
      }}
    >
      <View style={{ paddingBottom: 80, padding: 10 }}>
        <TouchableOpacity style={{ alignItems: "center" }}>
          <Mainlogo
            width={150}
            height={50}
            onPress={() => navigation.navigate("Bottom", { screen: "Home" })}
          />
        </TouchableOpacity>

        <SearchBar />

        <View
          style={{
            margin: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackwardIcon width={32} height={32} fill="#000" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 22,
              color: "black",
              fontWeight: "bold",
            }}
          >
            계정 정보
          </Text>
        </View>

        <View style={styles.myInfoContainer}>
          {/* 프로필 */}
          <View style={styles.profileContainer}>
            <View
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 1, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 4,
                elevation: 3,
                overflow: "visible",
              }}
            >
              <ImageBackground
                source={{ uri: selectedUser?.photoURL }}
                style={styles.imageBackground}
                imageStyle={styles.tumbnail}
              />
            </View>

            <View style={{ flexDirection: "column" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  marginHorizontal: 30,
                }}
              >
                {selectedUser.displayName}
              </Text>

              <View style={{ flexDirection: "row" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ marginLeft: 30, marginVertical: 5 }}>
                    팔로워
                  </Text>
                  <Text style={{ fontWeight: "bold", marginHorizontal: 5 }}>
                    {selectedUser.followerCnt}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ marginLeft: 30, marginVertical: 5 }}>
                    팔로잉
                  </Text>
                  <Text style={{ fontWeight: "bold", marginHorizontal: 5 }}>
                    {selectedUser.followingCnt}
                  </Text>
                </View>
              </View>

              {user && selectedUser.uid !== user.uid && (
                <TouchableOpacity
                  style={
                    followingMap[selectedUser.uid]
                      ? styles.unfollowBtn
                      : styles.followBtn
                  }
                  onPress={() =>
                    FollowUser({
                      user,
                      targetUser: {
                        uid: selectedUser.uid,
                        displayName: selectedUser.displayName,
                        photoURL: selectedUser.photoURL,
                      },
                      isFollowing: !!followingMap[selectedUser.uid],
                      expireAt,
                    })
                  }
                >
                  <Text
                    style={
                      followingMap[userId]
                        ? styles.unfollowBtnText
                        : styles.followBtnText
                    }
                  >
                    {followingMap[selectedUser.uid] ? "언팔로우" : "팔로우"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 사진 */}
          <View style={styles.ImageContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>사진</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "light",
                  color: colors.primary,
                  marginLeft: 5,
                }}
              >
                {allImages.length}
              </Text>
            </View>

            {allImages.length > 0 ? (
              <View>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {visibleImages.map((item, index) => (
                    <ImageBackground
                      key={index}
                      source={{ uri: item }}
                      style={styles.ImageFactors}
                    />
                  ))}
                </View>

                {allImages.length > 6 && (
                  <TouchableOpacity
                    onPress={() => setShowAllImages((prev) => !prev)}
                  >
                    <Text style={{ color: colors.primary, marginTop: 10 }}>
                      {showAllImages ? "접기" : "더보기"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#9b9b9b",
                    marginVertical: 20,
                  }}
                >
                  사진이 없습니다.
                </Text>
              </View>
            )}
          </View>

          {/* 후기 */}
          <View style={styles.reviewContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>후기</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "light",
                  color: colors.primary,
                  marginLeft: 5,
                }}
              >
                {review.length}
              </Text>
            </View>

            {review?.length > 0 ? (
              <View style={{ flexDirection: "row" }}>
                <FlatList
                  data={reviewPreview}
                  keyExtractor={(item) => item.seq}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <View>
                      <ImageBackground
                        source={{ uri: item.image }}
                        style={styles.reviewImage}
                      />
                      <Text
                        numberOfLines={2}
                        style={{
                          width: 180,
                          fontSize: 10,
                          color: "#535353",
                          textAlign: "center",
                          alignSelf: "center",
                        }}
                      >
                        {item.title}
                      </Text>
                    </View>
                  )}
                />
              </View>
            ) : (
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#9b9b9b",
                    marginVertical: 20,
                  }}
                >
                  리뷰가 없습니다.
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    width: "90%",
    justifyContent: "center",
    flexDirection: "column",
    borderWidth: 1,
    margin: "auto",
  },
  myInfoContainer: {
    width: "90%",
    height: "auto",
    flexDirection: "column",
    paddingVertical: 15,
    marginVertical: 15,
    marginHorizontal: "auto",
  },
  imageBackground: {
    width: 80,
    height: 80,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  tumbnail: {
    width: 80,
    height: 80,
    resizeMode: "cover",
  },
  profileContainer: {
    width: "100%",
    flexDirection: "row",
    margin: "auto",
    justifyContent: "sp",
    alignItems: "center",
  },
  followBtn: {
    width: "80%",
    marginLeft: 30,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  unfollowBtn: {
    width: "80%",
    marginLeft: 30,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followBtnText: {
    color: colors.white,
    fontWeight: "bold",
    textAlign: "center",
  },
  unfollowBtnText: {
    color: colors.primary,
    fontWeight: "bold",
    textAlign: "center",
  },
  ImageContainer: {
    width: "100%",
    height: "auto",
    flexDirection: "column",
    paddingVertical: 15,
    marginVertical: 25,
    marginHorizontal: "auto",
  },
  ImageFactors: {
    width: 100,
    height: 100,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 5,
    marginVertical: 10,
  },

  reviewContainer: {
    width: "100%",
    height: "auto",
    flexDirection: "column",
    paddingVertical: 15,
    marginVertical: 25,
    marginHorizontal: "auto",
  },
  reviewFactorContainer: {
    borderWidth: 1,
    marginRight: 10,
    marginVertical: 10,
    flexDirection: "column",
    justifyContent: "center",
  },
  reviewImage: {
    width: 220,
    height: 150,
    borderRadius: 20,
    overflow: "hidden",
    marginVertical: 10,
    marginRight: 5,
  },
});
