import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  FlatList,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackwardIcon from "../assets/icons/backward.svg";
import { AuthContext } from "../services/context";
import {
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function Profile({ route, navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const [followingMap, setFollowingMap] = useState({});
  const [followerMap, setFollowerMap] = useState({});
  const [selectedUser, setSelectedUser] = useState([]);
  const [reviewMap, setReviewMap] = useState({});
  const [review, setReview] = useState([]);
  const { userId } = route.params;

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

  console.log(review);

  // 팔로우, 언팔로우
  const FollowUser = async (targetUser) => {
    if (!user) {
      Alert.alert("로그인이 필요합니다.");
      return;
    }

    const targetUserId = targetUser.uid;

    const followingRef = doc(db, "users", user.uid, "following", targetUserId);
    const followerRef = doc(db, "users", targetUserId, "followers", user.uid);

    try {
      if (followingMap[targetUserId]) {
        // 언팔로우
        await deleteDoc(followingRef);
        await deleteDoc(followerRef);

        await updateDoc(doc(db, "users", user.uid), {
          followingCnt: increment(-1),
        });

        await updateDoc(doc(db, "users", targetUserId), {
          followerCnt: increment(-1),
        });
      } else {
        // 팔로우
        await setDoc(followingRef, {
          displayName: targetUser.displayName,
          photoURL: targetUser.photoURL || null,
          createdAt: serverTimestamp(),
        });

        await setDoc(followerRef, {
          displayName: user.displayName,
          photoURL: user.photoURL || null,
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "users", user.uid), {
          followingCnt: increment(1),
        });

        await updateDoc(doc(db, "users", targetUserId), {
          followerCnt: increment(1),
        });
      }
    } catch (error) {
      console.error("팔로우 토글 실패:", error);
      Alert.alert("팔로우/언팔로우 실패. 다시 시도해주세요.");
    }
  };

  return (
    <SafeAreaView style={styles.viewContainer}>
      <ScrollView>
        <TouchableOpacity
          style={{
            margin: 8,
          }}
          onPress={() => navigation.goBack()}
        >
          <BackwardIcon width={24} height={24} fill="#000" />
        </TouchableOpacity>
        <View style={styles.myInfoContainer}>
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
                source={{ uri: selectedUser.photoURL }}
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
                      uid: selectedUser.uid,
                      displayName: selectedUser.displayName,
                      photoURL: selectedUser.photoURL,
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

          <View style={styles.reviewContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>사진</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "light",
                  color: "#608D00",
                  marginLeft: 5,
                }}
              >
                {review.flatMap((r) => r.images || []).length}
              </Text>
            </View>
            <FlatList
              data={review.flatMap((r) => r.images || [])}
              keyExtractor={(item, index) => index.toString()}
              numColumns={3}
              renderItem={({ item }) => (
                <ImageBackground
                  source={{ uri: item }}
                  style={{ width: 100, height: 100 }}
                />
              )}
            />
          </View>

          <View style={styles.reviewContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>후기</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "light",
                  color: "#608D00",
                  marginLeft: 5,
                }}
              >
                {review.length}
              </Text>
            </View>

            <View>
              <ImageBackground source={{ uri: review.images }} />
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "#9b9b9b" }}
              >
                {review.title}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    // borderWidth: 1,
    // alignItems: "left",
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
    borderColor: "#9b9b9b",
  },
  tumbnail: {
    width: 80,
    height: 80,
    resizeMode: "cover",
  },
  profileContainer: {
    width: "100%",
    // borderWidth: 1,
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
    backgroundColor: "#608D00",
  },
  unfollowBtn: {
    width: "80%",
    marginLeft: 30,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#608D00",
  },
  followBtnText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  unfollowBtnText: {
    color: "#608D00",
    fontWeight: "bold",
    textAlign: "center",
  },
  reviewContainer: {
    width: "100%",
    height: "auto",
    borderWidth: 1,
    flexDirection: "column",
    paddingVertical: 15,
    marginVertical: 15,
    marginHorizontal: "auto",
  },
});
