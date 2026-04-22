import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import {
  FlatList,
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
import { AuthContext } from "../../store/context";
import { colors } from "../../styles/colors";

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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{ margin: 8 }}
              onPress={() => navigation.goBack()}
            >
              <BackwardIcon width={32} height={32} fill="#000" />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 22,
                color: "black",
                fontWeight: "bold",
              }}
            >
              좋아요
            </Text>
          </View>
          {myLikes.length === 0 ? (
            <Text>좋아요한 리뷰가 없습니다.</Text>
          ) : (
            <FlatList
              data={myLikes}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              renderItem={({ item }) => (
                <View style={styles.reviewCard}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginVertical: 15,
                      marginHorizontal: 10,
                    }}
                  >
                    <ImageBackground
                      source={{ uri: item.photoURL }}
                      style={styles.profileTumbnail}
                      imageStyle={styles.profileImage}
                      resizeMode="cover"
                    />
                    <Text style={{ fontWeight: "bold", color: "#000" }}>
                      {item.displayName}
                    </Text>
                  </View>
                  <View
                    style={{ flexDirection: "column", marginHorizontal: 13 }}
                  >
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.content}>{item.content}</Text>
                  </View>
                </View>
              )}
            />
          )}
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
  reviewCard: {
    margin: 12,
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  title: {
    fontWeight: "bold",
    marginVertical: 12,
  },
  content: {
    color: colors.text,
    marginBottom: 14,
  },
  profileTumbnail: {
    width: 40,
    height: 40,
    marginRight: 14,
    borderRadius: 100,
  },
  profileImage: {
    borderRadius: 100,
    borderColor: colors.primary,
    borderWidth: 1,
  },
});
