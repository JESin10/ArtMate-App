import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackwardIcon from "../../assets/icons/backward.svg";
import Mainlogo from "../../assets/icons/logo-main.svg";
import { AuthContext } from "../../services/context";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";
import SearchBar from "../../components/search/SearchBar";
import { useRoute } from "@react-navigation/native";

export default function FollowList({ navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const [followingMap, setFollowingMap] = useState({});
  const [followerMap, setFollowerMap] = useState({});
  const [followingList, setFollowingList] = useState([]);
  const [followerList, setFollowerList] = useState([]);
  const route = useRoute();
  const initialTab = route.params?.tab || "followers";
  const [tab, setTab] = useState(initialTab);
  const isMe = followingList.uid === user.uid;
  const now = Timestamp.now();
  const expireAt = Timestamp.fromMillis(
    now.toMillis() + 7 * 24 * 60 * 60 * 1000,
  );

  useEffect(() => {
    if (route.params?.tab) {
      setTab(route.params.tab);
    }
  }, [route.params?.tab]);

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

  //follower가져오기
  useEffect(() => {
    const ref = collection(db, "users", user.uid, "followers");

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));

      setFollowerList(list);
    });

    return () => unsubscribe();
  }, [user]);

  //following 가져오기
  useEffect(() => {
    const ref = collection(db, "users", user.uid, "following");

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));

      setFollowingList(list);
    });

    return () => unsubscribe();
  }, [user]);

  //팔로우 언팔로우
  const FollowUser = async (targetUser) => {
    const targetUserId = targetUser.uid;

    const followingRef = doc(db, "users", user.uid, "following", targetUserId);
    const followerRef = doc(db, "users", targetUserId, "followers", user.uid);

    try {
      if (followingMap[targetUserId]) {
        // 언팔로우
        await deleteDoc(followingRef);
        await deleteDoc(followerRef);
        await deleteFollowNotification(targetUserId);
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
        if (user.uid !== targetUserId) {
          await addDoc(collection(db, "users", targetUserId, "notifications"), {
            type: "follow",
            fromUserId: user.uid,
            createdAt: serverTimestamp(),
            fromUserName: user.displayName,
            fromUserPhoto: user.photoURL,
            isRead: false,
            expireAt: expireAt,
          });
        }
      }
    } catch (error) {
      console.error("팔로우 토글 실패:", error);
      Alert.alert("팔로우/언팔로우 실패. 다시 시도해주세요.");
    }
  };

  //언팔로우시 알림 삭제
  const deleteFollowNotification = async (targetUserId) => {
    const q = query(
      collection(db, "users", targetUserId, "notifications"),
      where("type", "==", "follow"),
      where("fromUserId", "==", user.uid),
    );

    const snapshot = await getDocs(q);

    snapshot.forEach(async (docSnap) => {
      await deleteDoc(docSnap.ref);
    });
  };

  return (
    <SafeAreaView
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

        <View style={styles.settingFactorContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
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
              팔로우
            </Text>
          </View>

          {/* 탭 버튼 */}
          <View style={styles.btnContainer}>
            <TouchableOpacity
              onPress={() => setTab("followers")}
              style={styles.btnFactor}
            >
              <Text
                style={{
                  color: tab === "followers" ? "white" : "#a9a9a9",
                  textAlign: "center",
                  fontWeight: tab === "followers" ? "bold" : "semibold",
                }}
              >
                {followerList.length} Followers
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTab("followings")}
              style={styles.btnFactor}
            >
              <Text
                style={{
                  color: tab === "followings" ? "white" : "#a9a9a9",
                  textAlign: "center",
                  fontWeight: tab === "followings" ? "bold" : "semibold",
                }}
              >
                {followingList.length} Followings
              </Text>
            </TouchableOpacity>
          </View>

          {/* 리스트 */}
          {tab === "followers" &&
            followerList.map((follower) => (
              <View key={follower.id} style={styles.followContainer}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ImageBackground
                    source={{ uri: follower.photoURL }}
                    style={styles.profileTumbnail}
                    imageStyle={styles.profileImage}
                    resizeMode="cover"
                  />
                  <Text>{follower.displayName}</Text>
                </View>
                {!isMe && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: followingMap[follower.uid]
                        ? "#ccc"
                        : "#608D00",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 10,
                    }}
                    onPress={() => FollowUser(follower)}
                  >
                    <Text style={{ color: "white" }}>
                      {followingMap[follower.uid] ? "언팔로우" : "팔로우"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

          {tab === "followings" &&
            followingList.map((following) => (
              <View key={following.id} style={styles.followContainer}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ImageBackground
                    source={{ uri: following.photoURL }}
                    style={styles.profileTumbnail}
                    imageStyle={styles.profileImage}
                    resizeMode="cover"
                  />
                  <Text>{following.displayName}</Text>
                </View>
                {!isMe && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: followingMap[following.uid]
                        ? "#ccc"
                        : "#608D00",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 10,
                    }}
                    onPress={() => FollowUser(following)}
                  >
                    <Text style={{ color: "white" }}>
                      {followingMap[following.uid] ? "언팔로우" : "팔로우"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  settingFactorContainer: {
    width: "100%",
    height: "100%",
    // borderWidth: 1,
  },
  btnContainer: {
    width: "95%",
    marginHorizontal: "auto",
    marginTop: 20,
    justifyContent: "center",
    flexDirection: "row",
  },
  btnFactor: {
    backgroundColor: "#608D00",
    width: "50%",
    padding: 10,
    justifyContent: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 0.3,
    borderColor: "#d9d9d9",
  },
  followContainer: {
    borderWidth: 1,
    borderColor: "#608D00",
    borderRadius: 10,
    padding: 10,
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileTumbnail: {
    width: 40,
    height: 40,
    marginRight: 14,
    borderRadius: 100,
  },
  profileImage: {
    borderRadius: 100,
    borderColor: "#608D00",
    borderWidth: 1,
  },
});
