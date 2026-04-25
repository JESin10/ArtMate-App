import { useRoute } from "@react-navigation/native";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../firebase";
import BackwardIcon from "../../assets/icons/backward.svg";
import Mainlogo from "../../assets/icons/logo-main.svg";
import SearchBar from "../../components/search/SearchBar";
import { FollowUser } from "../../services/followService";
import { AuthContext } from "../../store/context";
import { useUserStore } from "../../store/useUserStore";
import { colors } from "../../styles/colors";
import { fontSize, radius, spacing } from "../../styles/theme";

export default function FollowList({ navigation }) {
  const { user } = useContext(AuthContext);
  const { followingMap } = useUserStore();
  const [followingList, setFollowingList] = useState([]);
  const [followerList, setFollowerList] = useState([]);
  const route = useRoute();
  const initialTab = route.params?.tab || "followers";
  const [tab, setTab] = useState(initialTab);
  // const isMe = followingList.uid === user.uid;
  const now = Timestamp.now();
  const expireAt = Timestamp.fromMillis(
    now.toMillis() + 7 * 24 * 60 * 60 * 1000,
  );

  useEffect(() => {
    if (route.params?.tab) {
      setTab(route.params.tab);
    }
  }, [route.params?.tab]);

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
      <View style={{ paddingBottom: 80, padding: spacing.sm }}>
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
              <BackwardIcon width={32} height={32} fill={colors.black} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: fontSize.xl,
                color: colors.black,
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
                  color: tab === "followers" ? colors.white : colors.lightGray,
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
                  color: tab === "followings" ? colors.white : colors.lightGray,
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
            followerList?.map((follower) => (
              <View key={follower.uid} style={styles.followContainer}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ImageBackground
                    source={{ uri: follower.photoURL }}
                    style={styles.profileTumbnail}
                    imageStyle={styles.profileImage}
                    resizeMode="cover"
                  />
                  <Text>{follower.displayName}</Text>
                </View>
                {follower.uid !== user.uid && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: followingMap[follower.uid]
                        ? colors.lightGray
                        : colors.primary,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.xs,
                      borderRadius: radius.sm,
                    }}
                    onPress={() =>
                      FollowUser({
                        user,
                        targetUser: {
                          id: follower.uid,
                          displayName: follower.displayName,
                          photoURL: follower.photoURL,
                        },
                        isFollowing: !!followingMap[follower.uid],
                        expireAt,
                      })
                    }
                  >
                    <Text style={{ color: colors.white }}>
                      {followingMap[follower.uid] ? "언팔로우" : "팔로우"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

          {tab === "followings" &&
            followingList?.map((following) => (
              <View key={following.uid} style={styles.followContainer}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ImageBackground
                    source={{ uri: following.photoURL }}
                    style={styles.profileTumbnail}
                    imageStyle={styles.profileImage}
                    resizeMode="cover"
                  />
                  <Text>{following.displayName}</Text>
                </View>
                {following.uid !== user.uid && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: followingMap[following.uid]
                        ? colors.lightGray
                        : colors.primary,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.xs,
                      borderRadius: radius.sm,
                    }}
                    onPress={() =>
                      FollowUser({
                        user,
                        targetUser: {
                          id: following.uid,
                          displayName: following.displayName,
                          photoURL: following.photoURL,
                        },
                        isFollowing: !!followingMap[following.uid],
                        expireAt,
                      })
                    }
                  >
                    <Text style={{ color: colors.white }}>
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
  },
  btnContainer: {
    width: "95%",
    marginHorizontal: "auto",
    marginTop: spacing.xl,
    justifyContent: "center",
    flexDirection: "row",
  },
  btnFactor: {
    backgroundColor: colors.primary,
    width: "50%",
    padding: spacing.sm,
    justifyContent: "center",
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    borderWidth: 0.3,
    borderColor: colors.lightGray,
  },
  followContainer: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    padding: spacing.sm,
    margin: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileTumbnail: {
    width: 40,
    height: 40,
    marginRight: spacing.lg,
    borderRadius: 100,
  },
  profileImage: {
    borderRadius: 100,
    borderColor: colors.primary,
    borderWidth: 1,
  },
});
