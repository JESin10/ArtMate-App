import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  Query,
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
  FlatList,
  ImageBackground,
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
import { radius, spacing } from "../../styles/theme";
import { RootStackParamList } from "../../types/navigation";
import { ReviewPayload } from "../../types/review";
import styles from "./reviewStyles";

type Props = RootStackParamList<"ReviewMain">;

export default function Review({ route, navigation }: Props) {
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

  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is not available");
  }
  const { user } = useContext(AuthContext);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList<ReviewPayload> | null>(null);
  const now = Timestamp.now();
  const expireAt = Timestamp.fromMillis(now.toMillis() + 7 * 24 * 60 * 60 * 1000);
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
    let q: Query<ReviewPayload>;
    //firestore는 orderBy로 정렬
    if (sortType === "like") {
      q = query(reviewsRef, orderBy("LikeCnt", "desc"));
    } else {
      q = query(reviewsRef, orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data: ReviewPayload[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ReviewPayload, "id">),
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

      const snapshot = await getDocs(collection(db, "users", user.uid, "likedReview"));

      const liked: Record<string, boolean> = {};
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
      const map: Record<string, boolean> = {};
      snapshot.docs.forEach((doc) => {
        map[doc.id] = true;
      });
      setFollowingMap(map);
    });

    return () => unsubscribe();
  }, [user]);

  //리뷰 삭제
  const ReviewDelete = async (reviewId: string, userId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      await deleteDoc(doc(db, "users", userId, "reviews", reviewId));

      Alert.alert("안내", "리뷰가 삭제되었습니다.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("오류", "리뷰 삭제에 실패했습니다. 다시 시도해주세요.");
      }
    }

    //토글 좋아요
    const toggleLike = async (reviewUserId: string, reviewId: string): Promise<void> => {
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
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("좋아요 토글 실패:", error);
        }
      }
    };
    //좋아요 취소시 알림 삭제
    const deleteLikeNotification = async (
      reviewUserId: string,
      reviewId: string,
    ): Promise<void> => {
      if (!user) return;
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
            keyExtractor={(item: ReviewPayload) => item.seq}
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
                      <Text style={{ marginRight: spacing.sm }}>{review.displayName}</Text>
                    </TouchableOpacity>

                    {user && review.userId !== user.uid && (
                      <TouchableOpacity
                        style={followingMap[review.userId] ? styles.unfollowBtn : styles.followBtn}
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
                  <Text style={{ marginVertical: spacing.lg, fontWeight: "bold" }}>
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
                    <TouchableOpacity onPress={() => toggleLike(review.userId, review.id)}>
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
                        reviewId={review.id}
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
              setIsEditing(false);
              setSelectedReview(null);
              setShowModal(true);
            }}
          >
            <WriteIcon
              width={24}
              height={24}
              style={{ marginTop: spacing.md }}
              fill={colors.white}
            />
          </TouchableOpacity>
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
          reviewId={selectedReview?.id}
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
              <Text style={{ color: colors.white, marginTop: spacing.xs }}>로딩중...</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  };
}
