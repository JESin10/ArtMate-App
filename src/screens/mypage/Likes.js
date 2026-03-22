import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackwardIcon from "../../assets/icons/backward.svg";
import { AuthContext } from "../../services/context";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

export default function Likes({ navigation }) {
  const [myLikes, setMyLikes] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.uid) {
      fetchLikedReviews(user.uid);
    }
  }, [user?.uid]);

  // likedReview에서 reviewId 가져와 reviews 컬렉션 조회
  const fetchLikedReviews = async (uid) => {
    try {
      // 1. 내가 좋아요 누른 reviewId 목록 가져오기
      const likedSnapshot = await getDocs(
        collection(db, "users", uid, "likedReview"),
      );
      const likedReviewIds = likedSnapshot.docs.map(
        (doc) => doc.data().reviewId,
      );

      if (likedReviewIds.length === 0) {
        setMyLikes([]);
        return;
      }

      // 2. reviewId로 reviews 컬렉션 문서 병렬 조회
      const likedReviewsData = await Promise.all(
        likedReviewIds.map(async (reviewId) => {
          const reviewDoc = await getDoc(doc(db, "reviews", reviewId));
          return reviewDoc.exists()
            ? { id: reviewDoc.id, ...reviewDoc.data() }
            : null;
        }),
      );

      // null 제거 후 상태 업데이트
      setMyLikes(likedReviewsData.filter(Boolean));
    } catch (error) {
      console.error("북마크 불러오기 에러:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.settingFactorContainer}>
        <View style={styles.userSetting}>
          <TouchableOpacity
            style={{ margin: 8 }}
            onPress={() => navigation.goBack()}
          >
            <BackwardIcon width={24} height={24} fill="#fff" />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, padding: 8 }}>
          {myLikes.length === 0 ? (
            <Text>좋아요한 리뷰가 없습니다.</Text>
          ) : (
            myLikes.map((item) => (
              <View key={item.id} style={styles.reviewCard}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.content}>{item.content}</Text>
              </View>
            ))
          )}
        </ScrollView>
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
  userSetting: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewCard: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  content: {
    color: "#333",
  },
});
