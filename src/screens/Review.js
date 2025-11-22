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
} from "react-native";
import React, { useState, useRef, useEffect } from "react";

export default function Review() {
  const [exampleNum, setExampleNum] = useState(3);
  const [likeCnt, setLikeCnt] = useState(10);
  const [commentCnt, setCommentCnt] = useState(20);
  const [loading, setLoading] = useState(false);
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
        <View style={{ padding: 10 }}>
          <Text
            style={{
              fontSize: 35,
              fontWeight: "bold",
              color: "#333",
              marginVertical: 15,
              marginHorizontal: "auto",
            }}
          >
            ArtMate-Logo
          </Text>
          <View style={styles.searchbar}>
            <TextInput placeholder="search-bar" />
          </View>
          <View style={styles.topFactorContainer}>
            <Text style={styles.pageTitle}>관람후기</Text>
            <View style={styles.filterContianer}>
              <Text style={styles.filterFactor}>추천순</Text>
              <Text style={styles.filterFactor}>최근등록순</Text>
              <TouchableOpacity onPress={onRefresh} disabled={loading}>
                <Text style={styles.filterFactor}>새로고침</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.reviewsContainer}>
            {/* <View style={styles.reviewFactor}> */}
            {Array.from({ length: exampleNum }).map((_, idx) => (
              <View key={idx} style={styles.reviewFactor}>
                <View style={styles.profileContainer}>
                  <Text style={{ paddingRight: 10 }}>프로필이미지</Text>
                  <Text>프로필명</Text>
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
                    후기 내용 예시입니다. 말하는 사람은 ‘화자’에 대한 이야기다.
                    시에는 언제나 말하는 사람이 존재하는데, 화자는 시인 자신일
                    수도 있고 시인이 내세운 대리인 혹은 페르소나일 수도 있다.
                    전시는 정말 재미있었고, 작품들이 매우 인상적이었습니다. 특히
                    현대 미술 작품들이 마음에 들었고, 작가들의 창의적인 표현
                    방식이 인상적이었습니다. 전시회는 잘 구성되어 있었고, 작품들
                    사이의 흐름도 자연스러웠습니다. 전시회를 통해 새로운 시각과
                    영감을 얻을 수 있었습니다. 다음에도 꼭 방문하고 싶습니다.
                  </Text>
                </View>
                <View style={styles.reactionContainer}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity>
                      <Text style={{ marginRight: 5 }}>❤️</Text>
                    </TouchableOpacity>
                    <Text>{likeCnt}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity>
                      <Text style={{ marginRight: 5 }}> 📋 </Text>
                    </TouchableOpacity>
                    <Text>{commentCnt}</Text>
                  </View>
                </View>
              </View>
            ))}
            {/* </View> */}
          </View>
        </View>
      </ScrollView>
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
    borderWidth: 2,
    borderColor: "black",
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
    // justifyContent: "space-around",
  },
  filterFactor: {
    marginRight: 5,
    fontSize: 12,
    color: "black",
    fontWeight: "semi-bold",
  },
  reviewsContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "red",
    padding: 20,
    marginTop: 30,
    margin: "auto",
  },
  reviewFactor: {
    borderWidth: 1,
    borderColor: "blue",
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
  ReviewImage: {
    borderRadius: 10,
  },
  profileContainer: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 10,
    borderWidth: 1,
    borderColor: "green",
  },
  reviewTextContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: "purple",
  },
  reviewDescStyle: {
    fontSize: 12,
    color: "#333",
    marginVertical: 3,
    // rowGap: "120px",
  },
  reactionContainer: {
    width: "50%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
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
    zIndex: 999,
  },
  overlayContent: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
  },
});
