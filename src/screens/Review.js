import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  Button,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useRef, useEffect, useContext } from "react";
import ReviewModal from "../components/modals/ReviewModal";
import Mainlogo from "../assets/icons/logo-main.svg";
import ReloadIcon from "../assets/icons/reload.svg";
import FilledLikeIcon from "../assets/icons/heart-filled.svg";
import LikeIcon from "../assets/icons/heart.svg";
import CommentIcon from "../assets/icons/list.svg";
import WriteIcon from "../assets/icons/write.svg";
import { AuthContext } from "../services/context";
import useAllReview from "../components/hooks/useAllReview";
import {
  addDoc,
  deleteDoc,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  runTransaction,
  increment,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import CommentModal from "../components/modals/CommentModal";
import SearchBar from "../components/search/SearchBar";
import { Dimensions } from "react-native";
import ImageSlider from "../components/Slider/ImageSlider";
import ArtworkInfoModal from "../components/modals/ArtworkInfoModal";

export default function Review({ navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCmtModal, setShowCmtModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [likedMap, setLikedMap] = useState({});
  const [expandedMap, setExpandedMap] = useState({});
  const [reviews, setReviews] = useState([]);
  const [sortType, setSortType] = useState("like");
  const timerRef = useRef(null);
  const [showArtworkModal, setShowArtworkModal] = useState(false);
  const flatListRef = useRef(null);
  const scrollRef = useRef(null);
  const [followingMap, setFollowingMap] = useState({});

  // console.log(user);
  const onRefresh = React.useCallback(() => {
    setLoading(true);
    // 정렬 초기화
    setSortType("like");
    // 혹시 모를 상태 초기화 (선택)
    setSelectedReview(null);
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
  }, []);

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

      Alert.alert("리뷰가 삭제되었습니다.");
    } catch (error) {
      console.error("리뷰 삭제 에러:", error);
      Alert.alert("리뷰 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  //토글 좋아요
  const toggleLike = async (reviewUserId, reviewId) => {
    if (!user) {
      Alert.alert("로그인 후 이용 가능합니다");
      return;
    }

    const userLikeRef = doc(db, "users", user.uid, "likedReview", reviewId);
    const userReviewRef = doc(db, "users", reviewUserId, "reviews", reviewId);
    const reviewRef = doc(db, "reviews", reviewId);
    const alreadyLiked = !!likedMap[reviewId];

    try {
      if (alreadyLiked) {
        await deleteDoc(userLikeRef);
        await updateDoc(reviewRef, { LikeCnt: increment(-1) });
        await updateDoc(userReviewRef, { LikeCnt: increment(-1) });

        setLikedMap((prev) => {
          const newMap = { ...prev };
          delete newMap[reviewId];
          return newMap;
        });
      } else {
        await setDoc(userLikeRef, { reviewId, createdAt: serverTimestamp() });
        await updateDoc(reviewRef, { LikeCnt: increment(1) });
        await updateDoc(userReviewRef, { LikeCnt: increment(1) });

        setLikedMap((prev) => ({
          ...prev,
          [reviewId]: true,
        }));
      }
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
    }
  };

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
        <View style={styles.topFactorContainer}>
          <Text style={styles.pageTitle}>관람후기</Text>
          <View style={styles.filterContianer}>
            <TouchableOpacity onPress={() => setSortType("like")}>
              <Text
                style={[
                  styles.filterFactor,
                  sortType === "like" && {
                    fontWeight: "bold",
                    color: "#608D00",
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
                    color: "#608D00",
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
                  color: loading ? "#999" : "#333",
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          ref={flatListRef}
          data={reviews}
          keyExtractor={(item) => item.id}
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
                      navigation.navigate("Profile", {
                        userId: review.userId,
                      })
                    }
                  >
                    <ImageBackground
                      source={{ uri: review.photoURL }}
                      style={styles.ProfileTumbnail}
                      imageStyle={styles.ProfileImage}
                      resizeMode="cover"
                    />
                    <Text style={{ marginRight: 10 }}>
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
                          uid: review.userId,
                          displayName: review.displayName,
                          photoURL: review.photoURL,
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
                        // borderWidth: 1,
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#608D00" }}>수정</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => ReviewDelete(review.id, review.userId)}
                      style={{
                        paddingHorizontal: 10,
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
                  setSelectedReview(review.artworkId);
                }}
              >
                <Text style={{ marginVertical: 14, fontWeight: "bold" }}>
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
                          color: "#608D00",
                          marginTop: 4,
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
                        style={{ marginRight: 5 }}
                        fill="red"
                      />
                    ) : (
                      <LikeIcon
                        width={16}
                        height={16}
                        style={{ marginRight: 5 }}
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
                      style={{ marginRight: 5, marginLeft: 30 }}
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
          style={{ marginTop: 12, backgroundColor: "transparent" }}
          fill="#fff"
        />
      </View>
      <ArtworkInfoModal
        visible={showArtworkModal}
        onClose={() => {
          setShowArtworkModal(false);
          setSelectedReview([]);
        }}
        seq={selectedReview}
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
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: "#fff", marginTop: 8 }}>로딩중...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  searchbar: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    padding: 10,
    marginHorizontal: "auto",
    marginVertical: 15,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  topFactorContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    // borderWidth: 2,
    // borderColor: "black",
    padding: 10,
    alignItems: "center",
    margin: "auto",
  },
  pageTitle: {
    fontSize: 22,
    color: "black",
    fontWeight: "bold",
  },
  filterContianer: {
    width: "45%",
    marginLeft: 5,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  filterFactor: {
    marginRight: 10,
    fontSize: 12,
    color: "black",
    fontWeight: "semi-bold",
  },
  reviewsContainer: {
    width: "95%",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#608D00",
    padding: 20,
    marginTop: 20,
    margin: "auto",
  },
  reviewFactor: {
    // borderWidth: 1,
    // borderColor: "blue",
    marginBottom: 50,
    width: "100%",
    flexDirection: "column",
  },
  reviewTumblnail: {
    // width: "100%",
    // height: 270,
    // borderColor: "black",
    // borderwidth: 1,
    // padding: 10,
    // margin: 10,
    width: width * 0.9,
    height: 270,
  },
  ProfileTumbnail: {
    width: 40,
    height: 40,
    marginRight: 14,
    borderRadius: 100,
  },
  ProfileImage: {
    borderRadius: 100,
    borderColor: "#608D00",
    borderWidth: 1,
  },
  profileContainer: {
    width: "85%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 10,
    // borderWidth: 1,
    // borderColor: "green",
  },
  reviewTextContainer: {
    padding: 10,
    // borderWidth: 1,
    // borderColor: "purple",
  },
  reviewDescStyle: {
    fontSize: 12,
    color: "#333",
    marginVertical: 3,
    // rowGap: "120px",
    lineHeight: 20,
  },
  reactionContainer: {
    width: "95%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderTopColor: "#000",
    borderTopWidth: 1,
    // borderWidth: 1,
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
    padding: 20,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
  },
  ReviewBtn: {
    position: "absolute",
    zIndex: 999,
    bottom: 20,
    // left: 100,
    right: 20,
    // borderColor: "black",
    // borderWidth: ,
    borderRadius: 100,

    alignItems: "center",
    width: 50,
    height: 50,
    backgroundColor: "#608D00",
    pointerEvents: "box-none",
  },
  ReviewBtnInner: {
    width: 56,
    height: 56,
    position: "absolute",
    alignItems: "center",
  },
  ReviewBtnText: { margin: "auto", fontSize: 24 },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },

  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },

  activeIndicator: {
    backgroundColor: "#000",
  },
  followBtn: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#608D00",
  },
  unfollowBtn: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#608D00",
  },
  followBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  unfollowBtnText: {
    color: "#608D00",
    fontWeight: "bold",
  },
});
