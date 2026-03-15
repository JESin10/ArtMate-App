import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackwardIcon from "../assets/icons/backward.svg";
import { AuthContext } from "../services/context";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function FollowList({ navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const [followingMap, setFollowingMap] = useState({});
  const [followerMap, setFollowerMap] = useState({});
  const followerCnt = Object.keys(followerMap).length;
  const followingCnt = Object.keys(followingMap).length;
  const [followingList, setFollowingList] = useState([]);
  const [followerList, setFollowerList] = useState([]);

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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.settingFactorContainer}>
        <View>
          <TouchableOpacity
            style={{ margin: 8 }}
            onPress={() => navigation.goBack()}
          >
            <BackwardIcon width={24} height={24} fill="#fff" />
          </TouchableOpacity>
          <Text>Followers</Text>
          <Text> 총{followerList.length}명</Text>
          {followerList?.map((follower) => (
            <View>
              <Text>{follower.displayName}</Text>
            </View>
          ))}

          <Text>Followings</Text>
          <Text> 총{followingList.length}명</Text>
          {followingList?.map((following, index) => (
            <View>
              <Text>{following.displayName}</Text>
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
    borderWidth: 3,
    borderColor: "blue",
    backgroundColor: "#b5b5b5",
  },
});
