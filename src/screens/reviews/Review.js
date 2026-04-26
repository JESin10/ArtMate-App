import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../firebase";
import FilledLikeIcon from "../../assets/icons/heart-filled.svg";
import LikeIcon from "../../assets/icons/heart.svg";
import CommentIcon from "../../assets/icons/list.svg";
import Mainlogo from "../../assets/icons/logo-main.svg";
import ReloadIcon from "../../assets/icons/reload.svg";
import WriteIcon from "../../assets/icons/write.svg";
import ImageSlider from "../../components/Slider/ImageSlider";
import ArtworkInfoModal from "../../components/modals/ArtworkInfoModal";
import CommentModal from "../../components/modals/CommentModal";
import ReviewModal from "../../components/modals/ReviewModal";
import SearchBar from "../../components/search/SearchBar";
import { FollowUser } from "../../services/followService";
import { AuthContext } from "../../store/context";
import { useReviewStore } from "../../store/useReviewStore";
import { colors } from "../../styles/colors";
import { fontSize, radius, spacing } from "../../styles/theme";

export default function Review({ route, navigation }) {
  const {
    reviews,
    setReviews,
    likedMap,
    setLikedMap,
    loading,
    setLoading,
    sortType,
    setSortType,
    selectedReview,
    setSelectedReview,
    showModal,
    setShowModal,
    showCmtModal,
    setShowCmtModal,
    isEditing,
    setIsEditing,
    showArtworkModal,
    setShowArtworkModal,
    setSelectedArtworkId,
    selectedArtworkId,
    followingMap,
    setFollowingMap,
  } = useReviewStore();

  const { user } = useContext(AuthContext);
  const [expandedMap, setExpandedMap] = useState({});
  const timerRef = useRef(null);
  const flatListRef = useRef(null);
  const now = Timestamp.now();
  const expireAt = Timestamp.fromMillis(
    now.toMillis() + 7 * 24 * 60 * 60 * 1000,
  );
  const onRefresh = React.useCallback(() => {
    setLoading(true);
    setSortType("like");
    setSelectedReview(null);
    setSelectedArtworkId(null);
    setShowModal(false);
    setShowCmtModal(false);

    flatListRef.current?.scrollToOffset({
      offset: 0,
      animated: true,
    });

    timerRef.current = setTimeout(() => {
      setLoading(false);
      timerRef.current = null;
    }, 800);
  }, [
    setLoading,
    setSortType,
    setSelectedReview,
    setShowModal,
    setShowCmtModal,
    setSelectedArtworkId,
  ]);

  // 새로고침 타이머 정리용
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  //리뷰 실시간 구독(좋아요 숫자 정렬)
  useEffect(() => {
    const reviewsRef = collection(db, "reviews");
    let q;
    //firestore는 orderBy로 정렬
    if (sortType === "like") {
      q = query(reviewsRef, orderBy("LikeCnt", "desc"));
    } else {
      q = query(reviewsRef, orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReviews(data);
    });
    return () => unsubscribe();
  }, [sortType]);

  //유저별 좋아요 상태
  useEffect(() => {
    const fetchLikedReviews = async () => {
      if (!user) {
        setLikedMap({});
        return;
      }

      const snapshot = await getDocs(
        collection(db, "users", user.uid, "likedReview"),
      );

      const liked = {};
      snapshot.forEach((doc) => {
        liked[doc.id] = true;
      });

      setLikedMap(liked);
    };

    fetchLikedReviews();
  }, [user]);

  //팔로우여부 구독
  useEffect(() => {
    if (!user) return;

    const followingRef = collection(db, "users", user.uid, "following");

    const unsubscribe = onSnapshot(followingRef, (snapshot) => {
      const map = {};
      snapshot.docs.forEach((doc) => {
        map[doc.id] = true;
      });
      setFollowingMap(map);
    });

    return () => unsubscribe();
  }, [user]);

  //리뷰 삭제
  const ReviewDelete = async (reviewId, userId) => {
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      await deleteDoc(doc(db, "users", userId, "reviews", reviewId));

      Alert.alert("안내", "리뷰가 삭제되었습니다.");
    } catch (error) {
      Alert.alert("오류", "리뷰 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  //토글 좋아요
  const toggleLike = async (reviewUserId, reviewId) => {
    if (!user) {
      Alert.alert("안내", "로그인 후 이용 가능합니다");
      return;
    }

    const userLikeRef = doc(db, "users", user.uid, "likedReview", reviewId);
    const userReviewRef = doc(db, "users", reviewUserId, "reviews", reviewId);
    const reviewRef = doc(db, "reviews", reviewId);

    const alreadyLiked = !!likedMap[reviewId];

    try {
      if (alreadyLiked) {
        // 🔥 좋아요 취소
        await deleteDoc(userLikeRef);
        await updateDoc(reviewRef, { LikeCnt: increment(-1) });
        await updateDoc(userReviewRef, { LikeCnt: increment(-1) });
        if (user.uid !== reviewUserId) {
          await deleteLikeNotification(reviewUserId, reviewId);
        }
        setLikedMap((prev) => {
          const newMap = { ...prev };
          delete newMap[reviewId];
          return newMap;
        });
      } else {
        // 🔥 좋아요 추가
        await setDoc(userLikeRef, { reviewId, createdAt: serverTimestamp() });
        await updateDoc(reviewRef, { LikeCnt: increment(1) });
        await updateDoc(userReviewRef, { LikeCnt: increment(1) });

        setLikedMap((prev) => ({
          ...prev,
          [reviewId]: true,
        }));

        // 🔥 여기만 알림 생성
        if (user.uid !== reviewUserId) {
          await addDoc(collection(db, "users", reviewUserId, "notifications"), {
            type: "like",
            fromUserId: user.uid,
            fromUserName: user.displayName,
            fromUserPhoto: user.photoURL,
            reviewId: reviewId,
            createdAt: serverTimestamp(),
            expireAt: expireAt,
            isRead: false,
          });
        }
      }
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
    }
  };
  //좋아요 취소시 알림 삭제
  const deleteLikeNotification = async (reviewUserId, reviewId) => {
    const q = query(
      collection(db, "users", reviewUserId, "notifications"),
      where("type", "==", "like"),
      where("fromUserId", "==", user.uid),
      where("reviewId", "==", reviewId),
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
      <View style={{ paddingBottom: 80, padding: spacing.sm }}>
        <TouchableOpacity style={{ alignItems: "center" }}>
          <Mainlogo
            width={150}
            height={50}
            onPress={() => navigation.navigate("Bottom", { screen: "Home" })}
          />
        </TouchableOpacity>
        <SearchBar />
        <View style={styles.topFactorContainer}>
          <Text style={styles.pageTitle}>관람후기</Text>
          <View style={styles.filterContianer}>
            <TouchableOpacity onPress={() => setSortType("like")}>
              <Text
                style={[
                  styles.filterFactor,
                  sortType === "like" && {
                    fontWeight: "bold",
                    color: colors.primary,
                  },
                ]}
              >
                좋아요순
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSortType("recent")}>
              <Text
                style={[
                  styles.filterFactor,
                  sortType === "recent" && {
                    fontWeight: "bold",
                    color: colors.primary,
                  },
                ]}
              >
                최근등록순
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onRefresh} disabled={loading}>
              <ReloadIcon
                width={24}
                height={24}
                style={{
                  color: loading ? colors.lightGray : colors.gray,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          ref={flatListRef}
          data={reviews}
          keyExtractor={(item) => item.seq}
          initialNumToRender={5}
          windowSize={7}
          maxToRenderPerBatch={5}
          removeClippedSubviews={true}
          contentContainerStyle={styles.reviewsContainer}
          renderItem={({ item: review }) => (
            <View style={styles.reviewFactor}>
              <View
                style={{
                  width: "90%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={styles.profileContainer}>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() =>
                      navigation.navigate("Review", {
                        screen: "Profile",
                        params: { userId: review.userId },
                      })
                    }
                  >
                    <ImageBackground
                      source={{ uri: review.photoURL }}
                      style={styles.ProfileTumbnail}
                      imageStyle={styles.ProfileImage}
                      resizeMode="cover"
                    />
                    <Text style={{ marginRight: spacing.sm }}>
                      {review.displayName}
                    </Text>
                  </TouchableOpacity>

                  {user && review.userId !== user.uid && (
                    <TouchableOpacity
                      style={
                        followingMap[review.userId]
                          ? styles.unfollowBtn
                          : styles.followBtn
                      }
                      onPress={() =>
                        FollowUser({
                          user,
                          targetUser: {
                            id: review.userId,
                            displayName: review.displayName,
                            photoURL: review.photoURL,
                          },
                          isFollowing: !!followingMap[review.userId],
                          expireAt,
                        })
                      }
                    >
                      <Text
                        style={
                          followingMap[review.userId]
                            ? styles.unfollowBtnText
                            : styles.followBtnText
                        }
                      >
                        {followingMap[review.userId] ? "언팔로우" : "팔로우"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {user && review.userId === user.uid && (
                  <View style={{ flexDirection: "row", width: "28%" }}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedReview(review);
                        setIsEditing(true);
                        setShowModal(true);
                      }}
                      style={{
                        borderRadius: radius.sm,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: colors.primary }}>수정</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => ReviewDelete(review.id, review.userId)}
                      style={{
                        paddingHorizontal: spacing.sm,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "black" }}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={() => {
                  setShowArtworkModal(true);
                  setSelectedArtworkId(review.artworkId);
                }}
              >
                <Text
                  style={{ marginVertical: spacing.lg, fontWeight: "bold" }}
                >
                  {review.title}
                </Text>
              </TouchableOpacity>

              <ImageSlider images={review.images} />

              <View style={styles.reviewTextContainer}>
                <Text
                  style={styles.reviewDescStyle}
                  numberOfLines={expandedMap[review.id] ? undefined : 2} // 펼쳐진 경우 제한 없음
                  ellipsizeMode="tail"
                >
                  {review.content || "리뷰 내용이 없습니다."}
                </Text>
                {review.content &&
                  review.content.length > 50 && ( // 글 길이가 충분할 경우만 버튼
                    <TouchableOpacity
                      onPress={() =>
                        setExpandedMap((prev) => ({
                          ...prev,
                          [review.id]: !prev[review.id], // 토글
                        }))
                      }
                    >
                      <Text
                        style={{
                          color: colors.primary,
                          marginTop: spacing.xs,
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        {expandedMap[review.id] ? "접기" : "더보기"}
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>

              <View style={styles.reactionContainer}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => toggleLike(review.userId, review.id)}
                  >
                    {likedMap[review.id] ? (
                      <FilledLikeIcon
                        width={16}
                        height={16}
                        style={{ marginRight: spacing.xs }}
                        fill="red"
                      />
                    ) : (
                      <LikeIcon
                        width={16}
                        height={16}
                        style={{ marginRight: spacing.xs }}
                        fill="black"
                      />
                    )}
                  </TouchableOpacity>
                  <Text>{review.LikeCnt}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowCmtModal(true);
                      setSelectedReview(review);
                    }}
                  >
                    <CommentIcon
                      width={16}
                      height={16}
                      style={{
                        marginRight: spacing.xs,
                        marginLeft: spacing.xxxl,
                      }}
                      reviewId={reviews.id}
                    />
                  </TouchableOpacity>
                  <Text>{review.CommentCnt}</Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>
      <View style={styles.ReviewBtn}>
        <TouchableOpacity
          style={styles.ReviewBtnInner}
          activeOpacity={0.8}
          onPress={() => {
            if (!user) {
              alert("로그인이 필요한 서비스입니다.");
              return;
            }

            setIsEditing(false); // 🔥 수정모드 해제
            setSelectedReview(null); // 🔥 선택 리뷰 초기화
            setShowModal(true); // 모달 열기
          }}
        />
        <WriteIcon
          width={24}
          height={24}
          style={{ marginTop: spacing.md, backgroundColor: "transparent" }}
          fill={colors.white}
        />
      </View>
      <ArtworkInfoModal
        visible={showArtworkModal}
        onClose={() => {
          setShowArtworkModal(false);
          setSelectedArtworkId(null);
        }}
        seq={selectedArtworkId}
        artwork={reviews}
      />
      <CommentModal
        visible={showCmtModal}
        onClose={() => setShowCmtModal(false)}
        reviewId={selectedReview}
      />
      <ReviewModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setIsEditing(false);
          setSelectedReview(null);
        }}
        isEditing={isEditing}
        reviewData={selectedReview}
      />
      {loading && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={{ color: colors.white, marginTop: spacing.xs }}>
              로딩중...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  searchbar: {
    borderColor: colors.black,
    borderWidth: 1,
    borderRadius: radius.sm,
    width: "100%",
    padding: spacing.sm,
    marginHorizontal: "auto",
    marginVertical: spacing.lg,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  topFactorContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.sm,
    alignItems: "center",
    margin: "auto",
  },
  pageTitle: {
    fontSize: fontSize.xl,
    color: colors.black,
    fontWeight: "bold",
  },
  filterContianer: {
    width: "45%",
    marginLeft: spacing.xs,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  filterFactor: {
    marginRight: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.black,
    fontWeight: "semi-bold",
  },
  reviewsContainer: {
    width: "95%",
    borderWidth: 1,
    borderRadius: radius.sm,
    borderColor: colors.primary,
    padding: spacing.xl,
    marginTop: spacing.xl,
    margin: "auto",
  },
  reviewFactor: {
    marginBottom: 50,
    width: "100%",
    flexDirection: "column",
  },
  reviewTumblnail: {
    width: width * 0.9,
    height: 270,
  },
  ProfileTumbnail: {
    width: 40,
    height: 40,
    marginRight: spacing.lg,
    borderRadius: 100,
  },
  ProfileImage: {
    borderRadius: 100,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  profileContainer: {
    width: "85%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: spacing.sm,
  },
  reviewTextContainer: {
    padding: spacing.sm,
  },
  reviewDescStyle: {
    fontSize: fontSize.sm,
    color: colors.gray300,
    marginVertical: spacing.xs,
    lineHeight: spacing.xl,
  },
  reactionContainer: {
    width: "95%",
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: spacing.sm,
    borderTopColor: colors.black,
    borderTopWidth: 1,
    margin: "auto",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },
  overlayContent: {
    padding: spacing.xl,
    borderRadius: spacing.xs,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
  },
  ReviewBtn: {
    position: "absolute",
    zIndex: 999,
    bottom: spacing.xl,
    right: spacing.xl,
    borderRadius: "100%",

    alignItems: "center",
    width: 50,
    height: 50,
    backgroundColor: colors.primary,
    pointerEvents: "box-none",
  },
  ReviewBtnInner: {
    width: 56,
    height: 56,
    position: "absolute",
    alignItems: "center",
  },
  ReviewBtnText: { margin: "auto", fontSize: fontSize.xxl },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xs,
  },

  indicator: {
    width: 6,
    height: 6,
    borderRadius: "100%",
    backgroundColor: colors.lightGray,
    marginHorizontal: spacing.xs,
  },

  activeIndicator: {
    backgroundColor: colors.black,
  },
  followBtn: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    backgroundColor: colors.primary,
  },
  unfollowBtn: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followBtnText: {
    color: colors.white,
    fontWeight: "bold",
  },
  unfollowBtnText: {
    color: colors.primary,
    fontWeight: "bold",
  },
});
