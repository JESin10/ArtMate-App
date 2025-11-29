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
  FlatList,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { decode } from "html-entities"; // 추가: HTML 엔티티 디코드
import Recent from "../components/Recent";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { parseString } from "react-native-xml2js";
import ArtworkInfoModal from "../components/ArtworkInfoModal";
import RenderHTML from "react-native-render-html";
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
  const [showModal, setShowModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const CARD_WIDTH = 310;
  const ITEM_SPACING = 12;
  const ITEM_SIZE = CARD_WIDTH + ITEM_SPACING;
  // const { width } = useWindowDimensions();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const htmlToPlain = (html) => {
    if (!html) return "";
    const plain = String(html)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<p[^>]*>/gi, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/<\/?[^>]+(>|$)/g, "") // 남은 모든 태그 제거
      .trim();
    return decode(plain);
  };

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
  // console.log(artworks);

  useEffect(() => {
    getArtwork();
  }, []);

  const data = artworks.slice(0, 4); // 슬라이드에 사용할 데이터

  // ViewableItems 변경시 인덱스 동기화
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setCurrentIndex(idx);
    }
  });
  // 자동 슬라이드 (5초)
  useEffect(() => {
    if (!data || data.length === 0) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % data.length; // 마지막이면 0으로
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: next,
            animated: true,
            viewPosition: 0.5,
          });
        }
        return next;
      });
    }, 5000);

    return () => clearInterval(id);
  }, [data]);
  // dot 클릭 시 이동
  const goToIndex = useCallback(
    (index) => {
      if (!flatListRef.current) return;
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
      setCurrentIndex(index);
    },
    [flatListRef]
  );

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
              <FlatList
                ref={flatListRef}
                data={data}
                horizontal
                pagingEnabled={false}
                showHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => String(item.DP_SEQ ?? index)}
                contentContainerStyle={styles.recommandList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.recommandCard}
                    activeOpacity={0.8}
                    onPress={() => {
                      setShowModal(true);
                      setSelectedArtwork(item);
                    }}
                  >
                    <ImageBackground
                      source={{ uri: item.DP_MAIN_IMG }}
                      style={styles.recommandImage}
                      imageStyle={styles.backgroundImage}
                    />
                    <Text numberOfLines={1} style={styles.recommandPart}>
                      {item.DP_ART_PART}
                    </Text>
                    <Text numberOfLines={1} style={styles.recommandTitle}>
                      {item.DP_NAME}
                    </Text>
                    <Text numberOfLines={3} style={styles.DescStyle}>
                      {htmlToPlain(item.DP_INFO)}
                    </Text>
                    <Text style={styles.DescStyle}>
                      {item.DP_START} ~ {item.DP_END}
                    </Text>
                    {/* <RenderHTML
                      baseStyle={styles.DescStyle}
                      contentWidth={width}
                      source={{ html: item.DP_INFO }}
                      tagsStyles={{
                        p: { margin: 0, padding: 0, lineHeight: 12 },
                        br: { display: "none" },
                      }}
                      defaultTextProps={{
                        numberOfLines: 3,
                        ellipsizeMode: "tail",
                      }}
                      renderersProps={{
                        text: { numberOfLines: 3, ellipsizeMode: "tail" },
                      }}
                    /> 
                    // 3줄만 나오게 하는게 안되기 때문에 변경
                    */}
                  </TouchableOpacity>
                )}
                onViewableItemsChanged={onViewableItemsChanged.current}
                viewabilityConfig={viewConfigRef.current}
                getItemLayout={(d, index) => ({
                  length: ITEM_SIZE,
                  offset: ITEM_SIZE * index,
                  index,
                })}
              />
              <View style={styles.dotsContainer}>
                {data.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => goToIndex(idx)}
                    style={[
                      styles.dot,
                      currentIndex === idx && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            </View>
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
                  <TouchableOpacity
                    key={index}
                    style={ImgStyle}
                    onPress={() => {
                      setShowModal(true);
                      setSelectedArtwork(artwork);
                      // if (!details[artwork.seq]) getDetailPlace(item.seq);
                    }}
                  >
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

            <ArtworkInfoModal
              visible={showModal}
              initStart={startIndex}
              initEnd={endIndex}
              onClose={() => setShowModal(false)}
              artwork={selectedArtwork}
            />
          </View>
          <View style={styles.endedContainer}>
            <View style={styles.subTitle}>
              <Text style={styles.pageTitle}>종료예정 전시모음</Text>
              {endedArtworks.slice(0, 3).map((endedartwork, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.endedContents}
                    onPress={() => {
                      setShowModal(true);
                      setSelectedArtwork(endedartwork);
                    }}
                  >
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
                  </TouchableOpacity>
                );
              })}
            </View>

            <ArtworkInfoModal
              visible={showModal}
              initStart={startIndex}
              initEnd={endIndex}
              onClose={() => setShowModal(false)}
              artwork={selectedArtwork}
            />
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
  // recommandContents: {
  //   width: "100%",
  //   alignItems: "center",
  //   flexDirection: "column",
  //   borderColor: "orange",
  //   borderWidth: 2,
  //   height: "auto",
  //   padding: 20,
  //   marginBottom: 10,
  // },
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
  // recommandedImages: {
  //   width: "100%",
  //   height: 400,
  //   borderColor: "black",
  //   borderWidth: 1,
  //   marginBottom: 8,
  // },
  recommandList: {
    // paddingLeft: 10,
    paddingVertical: 8,
  },
  recommandCard: {
    width: 310,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 10,
    overflow: "hidden",
  },
  recommandImage: {
    width: "100%",
    height: 450,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommandPart: {
    fontSize: 12,
    color: "gray",
  },
  recommandTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    width: "100%",
    // backgroundColor: "blue",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 6,
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#333",
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
    marginVertical: 5,
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
