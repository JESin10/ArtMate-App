import {
  View,
  StyleSheet,
  Text,
  TextInput,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  Button,
  Alert,
} from "react-native";
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
} from "firebase/firestore";
import { db } from "../../firebase";
import CommentModal from "../components/modals/CommentModal";

export default function Review() {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCmtModal, setShowCmtModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [likeCnts, setLikeCnts] = useState(0);
  const [likedMap, setLikedMap] = useState({});
  const [reviews, setReviews] = useState([]);

  const timerRef = useRef(null);
  const onRefresh = React.useCallback(() => {
    setLoading(true);
    timerRef.current = setTimeout(() => {
      setLoading(false);
      timerRef.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("LikeCnt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReviews(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLikedReviews = async () => {
      // 🔥 로그아웃 상태면 likedMap 초기화
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

  const toggleLike = async (reviewId) => {
    if (!user) {
      Alert.alert("로그인 후 이용 가능합니다");
      return;
    }

    const userLikeRef = doc(db, "users", user.uid, "likedReview", reviewId);
    const reviewRef = doc(db, "reviews", reviewId);

    const alreadyLiked = !!likedMap[reviewId];

    try {
      if (alreadyLiked) {
        await deleteDoc(userLikeRef);
        await updateDoc(reviewRef, { LikeCnt: increment(-1) });

        setLikedMap((prev) => {
          const newMap = { ...prev };
          delete newMap[reviewId];
          return newMap;
        });
      } else {
        await setDoc(userLikeRef, { reviewId });
        await updateDoc(reviewRef, { LikeCnt: increment(1) });

        setLikedMap((prev) => ({
          ...prev,
          [reviewId]: true,
        }));
      }
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
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
      }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ padding: 10 }}>
          <TouchableOpacity style={{ alignItems: "center" }}>
            <Mainlogo width={150} height={50} />
          </TouchableOpacity>
          <View style={styles.searchbar}>
            <TextInput placeholder="search-bar" />
          </View>
          <View style={styles.topFactorContainer}>
            <Text style={styles.pageTitle}>관람후기</Text>
            <View style={styles.filterContianer}>
              <Text style={styles.filterFactor}>추천순</Text>
              <Text style={styles.filterFactor}>최근등록순</Text>
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
          <View style={styles.reviewsContainer}>
            {reviews?.map((review, idx) => (
              <View key={review.id || idx} style={styles.reviewFactor}>
                <View
                  style={{
                    width: "90%",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={styles.profileContainer}>
                    <ImageBackground
                      source={require("../../src/assets/images/ex.jpg")}
                      style={styles.ProfileTumbnail}
                      imageStyle={styles.ProfileImage}
                      resizeMode="cover"
                    />
                    <Text>{review.displayName || "익명"}</Text>
                  </View>
                  {user && review.userId === user.uid && (
                    <View style={{ flexDirection: "row" }}>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedReview(review);
                          setIsEditing(true);
                          setShowModal(true);
                        }}
                      >
                        <Text>수정</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => ReviewDelete(review.id, review.userId)}
                      >
                        <Text style={{ color: "red" }}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <ImageBackground
                  key={idx}
                  source={require("../../src/assets/images/ex.jpg")}
                  style={styles.reviewTumblnail}
                  imageStyle={styles.ReviewImage}
                  resizeMode="cover"
                />

                <View style={styles.reviewTextContainer}>
                  <Text
                    style={styles.reviewDescStyle}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                  >
                    {review.content || "리뷰 내용이 없습니다."}
                  </Text>
                </View>

                <View style={styles.reactionContainer}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => toggleLike(review.id)}>
                      {likedMap[review.id] ? (
                        <FilledLikeIcon width={16} height={16} fill="red" />
                      ) : (
                        <LikeIcon width={16} height={16} />
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
            ))}
          </View>
        </View>
      </ScrollView>
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
    width: "100%",
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
    width: "100%",
    height: 270,
    borderColor: "black",
    borderwidth: 1,
    padding: 10,
    margin: 10,
  },
  ProfileTumbnail: {
    width: 40,
    height: 40,
    marginRight: 20,
    borderColor: "#A8A8A8",
    borderWidth: 1,
    borderRadius: 100,
  },
  ProfileImage: {
    borderRadius: 100,
  },
  profileContainer: {
    width: "100%",
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
  },
  reactionContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: 10,
    borderTopColor: "#000",
    borderTopWidth: 1,
    // borderWidth: 1,
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
});
