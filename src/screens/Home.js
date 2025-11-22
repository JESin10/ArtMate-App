import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  Button,
} from "react-native";
import Recent from "../components/Recent";
import React, { useState, useEffect } from "react";
import { parseString } from "react-native-xml2js";
const SERVER_URL = "http://openapi.seoul.go.kr:8088";
const API_KEY = "6b44656447746c733835476551776c";

export default function Home() {
  const [artworks, setArtworks] = useState([]); // 작품들 전체
  const [recentArtworks, setRecentArtworks] = useState([]); // 금주의 최신작품
  const [endedArtworks, setEndedArtworks] = useState([]); // 종료예정 작품
  const [artist, setArtist] = useState([]); // 현재 전시중인 작가
  const [loading, setLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(1);
  const [endIndex, setEndIndex] = useState(10);

  const getArtwork = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${SERVER_URL}/${API_KEY}/xml/ListExhibitionOfSeoulMOAInfo/${parseInt(
          startIndex,
          10
        )}/${parseInt(endIndex, 10)}/`
      );
      const xmlText = await response.text();

      parseString(xmlText, { explicitArray: false }, (err, jsonData) => {
        if (err) {
          setArtworks([]);
          setLoading(false);
          return;
        }
        let items = jsonData.ListExhibitionOfSeoulMOAInfo?.row || [];

        if (!Array.isArray(items)) items = [items];

        setArtworks(items);
        setLoading(false);
      });
    } catch (error) {
      setLoading(false);
      console.error("홈화면 작품 불러오기 오류:", error);
    }
  };
  // console.log(artworks.slice(0, 2));
  const getRecentArtworks = async () => {
    // 유사하게 최근 작품 불러오는 함수 구현 가능
  };

  const getEndedArtworks = async () => {
    // 유사하게 종료 예정 작품 불러오는 함수 구현 가능
  };

  useEffect(() => {
    getArtwork();
  }, []);

  // 날짜 문자열을 안전하게 Date로 파싱 (YYYY-MM-DD 같은 형태 예상)
  const parseDateSafe = (dateStr) => {
    if (!dateStr) return null;
    // 일부 API가 "YYYY.MM.DD" 등으로 줄 경우를 대비
    const normalized = String(dateStr).trim().replace(/\./g, "-").slice(0, 10);
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  };

  // artworks 배열을 받아 DP_START 기준으로 현재 날짜와 가까운 순으로 정렬하여 설정
  const computeRecentArtworks = (items) => {
    const today = new Date();
    const mapped = items
      .map((it) => ({
        raw: it,
        start: parseDateSafe(it.DP_START),
      }))
      .filter((x) => x.start !== null); // 시작일 없는 항목은 제외 (원하면 include)

    mapped.sort((a, b) => {
      const aFuture = a.start >= today;
      const bFuture = b.start >= today;
      if (aFuture !== bFuture) return aFuture ? -1 : 1; // 미래 시작 먼저
      const aDiff = Math.abs(a.start - today);
      const bDiff = Math.abs(b.start - today);
      return aDiff - bDiff;
    });

    return mapped.map((m) => m.raw);
  };

  // artworks 배열을 받아 DP_END 기준으로 현재 날짜와 가까운 순으로 정렬하여 설정
  const computeEndedArtworks = (items) => {
    const today = new Date();
    const mapped = items
      .map((it) => ({
        raw: it,
        end: parseDateSafe(it.DP_END),
      }))
      .filter((x) => x.end !== null); // 종료일 없는 항목은 제외

    mapped.sort((a, b) => {
      const aFuture = a.end >= today;
      const bFuture = b.end >= today;
      if (aFuture !== bFuture) return aFuture ? -1 : 1; // 곧 종료되는(미래 종료) 항목 우선
      const aDiff = Math.abs(a.end - today);
      const bDiff = Math.abs(b.end - today);
      return aDiff - bDiff;
    });

    return mapped.map((m) => m.raw);
  };

  // artworks가 바뀔 때마다 recent/ended 계산
  useEffect(() => {
    if (!artworks || artworks.length === 0) {
      setRecentArtworks([]);
      setEndedArtworks([]);
      return;
    }
    setRecentArtworks(computeRecentArtworks(artworks));
    setEndedArtworks(computeEndedArtworks(artworks));
  }, [artworks]);

  // console.log("종료:", endedArtworks);

  return (
    <SafeAreaView
      style={{
        width: "95%",
        height: "100%",
        marginHorizontal: "auto",
        flexDirection: "column",
      }}
    >
      <ScrollView>
        {/* <TouchableOpacity style={styles.container}> */}
        <View style={styles.container}>
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
          <View style={styles.recommandContainer}>
            <View style={styles.subTitle}>
              <Text style={styles.pageTitle}>ㅇㅇ님의 취향저격 전시모음</Text>
              {artworks.slice(0, 5).map((artwork, index) => (
                <View key={index} style={styles.recommandContents}>
                  <ImageBackground
                    source={{ uri: artwork.DP_MAIN_IMG }}
                    style={styles.recommandedImages}
                  />
                  <Text>{artwork.DP_ART_PART}</Text>
                  <Text>{artwork.DP_NAME}</Text>
                  <Text
                    style={styles.DescStyle}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                  >
                    {artwork.DP_INFO}
                  </Text>
                  <Text>
                    {artwork.DP_START} - {artwork.DP_END}
                  </Text>
                </View>
              ))}
            </View>
            {/* <View style={styles.recommandedImages}>
              <Text>images</Text>
            </View> */}
          </View>
          <View style={styles.recentContainer}>
            <View style={styles.subTitle}>
              <Text style={styles.pageTitle}>금주의 최신 전시모음</Text>
            </View>
            <View style={styles.recentContents}>
              {recentArtworks.slice(0, 4).map((artwork, index) => {
                const recentNum = index % 4;
                const ImgStyle =
                  recentNum === 0
                    ? styles.recentImagesS
                    : recentNum === 1
                    ? styles.recentImagesL
                    : recentNum === 2
                    ? styles.recentImagesL
                    : styles.recentImagesS;
                return (
                  <TouchableOpacity key={index} style={ImgStyle}>
                    {/* <ImageBackground
                      key={index}
                      source={{ uri: artwork.DP_MAIN_IMG }}
                      style={ImgStyle}
                    /> */}
                    <ImageBackground
                      source={{ uri: artwork.DP_MAIN_IMG }}
                      style={styles.imageBackground}
                      imageStyle={styles.backgroundImage}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.buttonContainer}>
              <Button title="이전" />
              <Text>페이지수</Text>
              <Button title="다음" />
            </View>

            <Recent />
          </View>
          <View style={styles.endedContainer}>
            <View style={styles.subTitle}>
              <Text style={styles.pageTitle}>종료예정 전시모음</Text>
              {endedArtworks.slice(0, 3).map((endedartwork, index) => {
                return (
                  <View key={index} style={styles.endedContents}>
                    <ImageBackground
                      source={{ uri: endedartwork.DP_MAIN_IMG }}
                      style={styles.endedImages}
                      // imageStyle={styles.backgroundImage}
                    />
                    <View style={{ flexDirection: "column" }}>
                      <Text
                        style={{
                          color: "gray",
                          marginBottom: "5",
                          fontSize: "10",
                        }}
                      >
                        {endedartwork.DP_END}까지 만날 수 있는 전시!
                      </Text>
                      <Text
                        style={{
                          color: "gray",
                          fontSize: "13",
                          flexWrap: "wrap",
                        }}
                      >
                        {endedartwork.DP_NAME}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
          <View style={styles.artistContainer}>
            <View style={styles.subTitle}>
              <Text style={styles.pageTitle}>현재 전시중인 작가</Text>
            </View>
            <View>
              {recentArtworks.slice(0, 4).map((artwork, index) => {
                return (
                  <View key={index}>
                    <Text>{artwork.DP_ARTIST}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* <Text style={styles.title}>Home Screen</Text> */}
        </View>
        {/* </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  pageTitle: {
    fontSize: 22,
    color: "black",
    fontWeight: "bold",
  },
  searchbar: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    padding: 10,
    marginVertical: 15,
    marginHorizontal: "auto",
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  subTitle: {
    fontSize: 22,
    fontWeight: "semibold",
    alignItems: "flex-start",
    width: "100%",
    paddingVertical: 10,
  },
  recommandedImages: {
    width: "100%",
    height: 400,
    borderColor: "black",
    borderWidth: 1,
  },
  DescStyle: {
    fontSize: 10,
    color: "#333",
    marginVertical: 2,
  },
  backgroundImage: {
    borderRadius: 10,
  },
  artistImages: {
    width: "100%",
    height: 100,
    borderColor: "black",
    borderWidth: 1,
  },
  recommandContents: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    borderColor: "orange",
    borderWidth: 2,
    height: "auto",
    padding: 20,
    marginBottom: 10,
  },
  recommandContainer: {
    width: "100%",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    borderColor: "red",
    borderWidth: 2,
    height: "auto",
    padding: 20,
    marginBottom: 10,
  },
  recentContainer: {
    width: "100%",
    // height: "100%",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
    // flexDirection: "column",
    borderColor: "blue",
    borderWidth: 2,
    height: "auto",
    padding: 20,
    marginBottom: 10,
  },
  recentContents: {
    width: "100%",
    height: "auto",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "spce-between",
    borderColor: "skyblue",
    borderWidth: 1,
  },
  recentImagesS: {
    width: "55%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 10,
    // padding: 5,
  },
  recentImagesL: {
    width: "45%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderColor: "yellow",
    borderWidth: 1,
    borderRadius: 10,
    // padding: 5,
    // marginHorizontal: "auto",
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: "10",
    paddingRight: "10",

    borderColor: "black",
    borderWidth: 1,
  },
  imageBackground: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "green",
    borderWidth: 1,
    borderRadius: 10,
  },
  backgroundImage: {
    borderRadius: 10,
  },
  endedImages: {
    width: 130,
    height: 90,
    borderColor: "black",
    borderWidth: 1,
  },
  endedContents: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    borderColor: "red",
    borderWidth: 2,
    height: "auto",
    // padding: 20,
    // marginVertical: 10,
  },
  endedContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    borderColor: "green",
    borderWidth: 2,
    height: "auto",
    padding: 20,
    marginBottom: 10,
  },
  artistContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    borderColor: "purple",
    borderWidth: 2,
    height: "auto",
    padding: 20,
  },
});
