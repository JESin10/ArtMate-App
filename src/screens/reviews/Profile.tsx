import { collection, doc, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { FlatList, ImageBackground, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../firebase";
import BackwardIcon from "../../assets/icons/backward.svg";
import Mainlogo from "../../assets/icons/logo-main.svg";
import SearchBar from "../../components/search/SearchBar";
import { FollowUser } from "../../services/followService";
import { AuthContext } from "../../store/context";
import { useUserStore } from "../../store/useUserStore";
import { colors } from "../../styles/colors";
import { fontSize, spacing } from "../../styles/theme";
import { RootStackScreenProps } from "../../types/navigation";
import { ReviewPayload } from "../../types/review";
import { SelectedUser } from "../../types/user";
import styles from "./profileStyles";

type Props = RootStackScreenProps<"Profile">;

export default function Profile({ route, navigation }: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is not available");
  }
  const { user } = authContext;
  const { followingMap, setFollowingMap, setFollowerMap } = useUserStore();
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [showAllImages, setShowAllImages] = useState<boolean>(false);
  const [review, setReview] = useState<ReviewPayload[]>([]);
  const { userId } = route.params;
  const allImages = review.flatMap((r) => r.images || []);
  const reviewPreview: { image?: string; title: string }[] = review.map((r) => ({
    image: r.images?.[0],
    title: r.title,
  }));
  const visibleImages = showAllImages ? allImages : allImages.slice(0, 6);
  const now = Timestamp.now();
  const expireAt = Timestamp.fromMillis(now.toMillis() + 7 * 24 * 60 * 60 * 1000);

  //팔로잉 팔로워 구독
  useEffect(() => {
    if (!user) return;

    // 팔로워 구독
    const followersRef = collection(db, "users", user.uid, "followers");
    const unsubscribeFollowers = onSnapshot(followersRef, (snapshot) => {
      const follower: Record<string, boolean> = {};
      // 컬렉션 문서 개수 = 팔로워 수
      snapshot.docs.forEach((docSnap) => {
        follower[docSnap.id] = true;
      });
      setFollowerMap(follower);
    });

    // 팔로잉 구독
    const followingRef = collection(db, "users", user.uid, "following");
    const unsubscribeFollowing = onSnapshot(followingRef, (snapshot) => {
      const following: Record<string, boolean> = {};
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
      const reviews: ReviewPayload[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReview(reviews);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <SafeAreaView
      style={{
        width: "95%",
        marginHorizontal: "auto",
        flexDirection: "column",
        flex: 1,
        position: "relative", // overlay를 위해 상대 위치 필요
      }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
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
              margin: spacing.xs,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
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
              계정 정보
            </Text>
          </View>

          <View style={styles.myInfoContainer}>
            {/* 프로필 */}
            <View style={styles.profileContainer}>
              <View
                style={{
                  shadowColor: colors.black,
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
                    fontSize: fontSize.md,
                    fontWeight: "bold",
                    marginHorizontal: spacing.xxxl,
                    marginBottom: spacing.xs,
                  }}
                >
                  {selectedUser?.displayName}
                </Text>

                <View style={{ flexDirection: "row", marginBottom: spacing.xs }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        marginLeft: spacing.xxxl,
                        marginVertical: spacing.xs,
                      }}
                    >
                      팔로워
                    </Text>
                    <Text
                      style={{
                        fontWeight: "bold",
                        marginHorizontal: spacing.xs,
                      }}
                    >
                      {selectedUser?.followerCnt}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        marginLeft: spacing.xxxl,
                        marginVertical: spacing.xs,
                      }}
                    >
                      팔로잉
                    </Text>
                    <Text
                      style={{
                        fontWeight: "bold",
                        marginHorizontal: spacing.xs,
                      }}
                    >
                      {selectedUser?.followingCnt}
                    </Text>
                  </View>
                </View>

                {user && selectedUser?.id !== user.uid && (
                  <TouchableOpacity
                    style={followingMap[selectedUser?.id] ? styles.unfollowBtn : styles.followBtn}
                    onPress={() =>
                      FollowUser({
                        user,
                        targetUser: {
                          id: selectedUser.id,
                          displayName: selectedUser.displayName,
                          photoURL: selectedUser.photoURL,
                        },
                        isFollowing: !!followingMap[selectedUser.id],
                        expireAt,
                      })
                    }
                  >
                    <Text
                      style={followingMap[userId] ? styles.unfollowBtnText : styles.followBtnText}
                    >
                      {followingMap[selectedUser.id] ? "언팔로우" : "팔로우"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* 사진 */}
            <View style={styles.ImageContainer}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: spacing.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.md,
                    fontWeight: "bold",
                  }}
                >
                  사진
                </Text>
                <Text
                  style={{
                    fontSize: spacing.md,
                    fontWeight: "300",
                    color: colors.primary,
                    marginLeft: spacing.xs,
                  }}
                >
                  {allImages.length}
                </Text>
              </View>

              {allImages.length > 0 ? (
                <View>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {visibleImages.map((item: string, index: number) => (
                      <ImageBackground
                        key={index}
                        source={{ uri: item }}
                        style={styles.ImageFactors}
                      />
                    ))}
                  </View>
                  {allImages.length > 6 && (
                    <TouchableOpacity onPress={() => setShowAllImages((prev) => !prev)}>
                      <Text style={{ color: colors.primary, marginTop: spacing.sm }}>
                        {showAllImages ? "접기" : "더보기"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View>
                  <Text
                    style={{
                      fontSize: fontSize.sm,
                      fontWeight: "bold",
                      color: colors.lightGray,
                      marginVertical: spacing.xl,
                    }}
                  >
                    사진이 없습니다.
                  </Text>
                </View>
              )}
            </View>

            {/* 후기 */}
            <View style={styles.reviewContainer}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: spacing.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.md,
                    fontWeight: "bold",
                  }}
                >
                  후기
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    fontWeight: "300",
                    color: colors.primary,
                    marginLeft: spacing.xs,
                  }}
                >
                  {review.length}
                </Text>
              </View>

              {review?.length > 0 ? (
                <View style={{ flexDirection: "row" }}>
                  <FlatList
                    data={reviewPreview}
                    keyExtractor={(_, index) => index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <View>
                        <ImageBackground source={{ uri: item.image }} style={styles.reviewImage} />
                        <Text
                          numberOfLines={2}
                          style={{
                            width: 180,
                            fontSize: fontSize.sm,
                            color: colors.gray,
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
                      fontSize: fontSize.sm,
                      fontWeight: "bold",
                      color: colors.lightGray,
                      marginVertical: spacing.xl,
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
    </SafeAreaView>
  );
}
