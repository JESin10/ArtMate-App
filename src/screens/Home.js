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

import BackwardIcon from "../assets/icons/backward.svg";
import ForwardIcon from "../assets/icons/forward.svg";
import Mainlogo from "../assets/icons/logo-main.svg";

const SERVER_URL = "https://apis.data.go.kr/B553457/cultureinfo/period2";
const API_KEY =
  "iUshbHgoTGazZCC2/6vIBZp/B97CWSUUeLAbmBto9st2Aj33IThDavcN4Cy1W8e/dbjWYG0yBe5qU2lZ/ZlPMg==";

export default function Home({ navigation }) {
  const [artworks, setArtworks] = useState([]); // 작품들 전체
  const [recentArtworks, setRecentArtworks] = useState([]); // 금주의 최신작품
  const [recentPage, setRecentPage] = useState(0);
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
  const RECENT_PER_PAGE = 4;
  const RECENT_TOTAL_ITEMS = 16; // 총 슬롯 수 (항상 16개로 맞춤)
  const recentTotalPages = Math.max(
    1,
    Math.ceil(RECENT_TOTAL_ITEMS / RECENT_PER_PAGE)
  );

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
      const url = `${SERVER_URL}?serviceKey=${API_KEY}&PageNo=${parseInt(
        1
      )}&numOfrows=${parseInt(20)}/`;
      console.log("[Home] getArtwork url:", url);
      const response = await fetch(url);
      const xmlText = await response.text();
      console.log(
        "[Home] getArtwork xmlText (start):",
        xmlText?.slice(0, 1000)
      );

      parseString(xmlText, { explicitArray: false }, (err, jsonData) => {
        if (err) {
          console.error("[Home] parseString error:", err);
          setArtworks([]);
          setLoading(false);
          return;
        }
        console.log(
          "[Home] getArtwork jsonData keys:",
          Object.keys(jsonData || {})
        );
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

  useEffect(() => {
    if (recentPage >= recentTotalPages) setRecentPage(0);
  }, [recentArtworks, recentTotalPages]);

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

  // 날짜 문자열을 'M월 D일' 형식으로 변환 (예: 2026-04-01 -> 4월 1일)
  const formatDateKorean = (dateStr) => {
    const d = parseDateSafe(dateStr);
    if (!d) return dateStr ?? "";
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}월 ${day}일`;
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

  // Prepare fixed 16-slot array for recent grid; fill missing slots with null placeholders
  const filledRecent = (() => {
    const arr = recentArtworks.slice(0, RECENT_TOTAL_ITEMS);
    while (arr.length < RECENT_TOTAL_ITEMS) arr.push(null);
    return arr;
  })();

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
          <TouchableOpacity>
            <Mainlogo width={150} height={50} />
          </TouchableOpacity>
          <View style={styles.searchbar}>
            <TextInput placeholder="search-bar" />
          </View>
          <View style={styles.recommandContainer}>
            <View style={styles.subTitle}>
              <Text style={styles.pageTitle}>ㅇㅇ님의 취향저격 전시모음</Text>
              <View style={styles.recommandFactor}>
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
                        imageStyle={styles.MainbackgroundImage}
                      />
                      <View
                        style={{
                          flexDirection: "column",
                          backgroundColor: "#608D00",
                          padding: 8,
                          borderBottomLeftRadius: 10,
                          borderBottomRightRadius: 10,
                        }}
                      >
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
                      </View>
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
              </View>
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
              {filledRecent
                .slice(
                  recentPage * RECENT_PER_PAGE,
                  recentPage * RECENT_PER_PAGE + RECENT_PER_PAGE
                )
                .map((artwork, index) => {
                  const recentNum = index % 4;
                  const ImgStyle =
                    recentNum === 0
                      ? styles.recentImagesS
                      : recentNum === 1
                      ? styles.recentImagesL
                      : recentNum === 2
                      ? styles.recentImagesL
                      : styles.recentImagesS;

                  if (artwork) {
                    return (
                      <TouchableOpacity
                        key={artwork.DP_SEQ ?? index}
                        style={ImgStyle}
                        onPress={() => {
                          setShowModal(true);
                          setSelectedArtwork(artwork);
                        }}
                      >
                        <ImageBackground
                          source={{ uri: artwork.DP_MAIN_IMG }}
                          style={styles.imageBackground}
                          imageStyle={styles.backgroundImage}
                        />
                      </TouchableOpacity>
                    );
                  }

                  // Placeholder: green empty tile when no artwork
                  return (
                    <View
                      key={"empty-" + index}
                      style={[ImgStyle, styles.recentPlaceholder]}
                    />
                  );
                })}
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => setRecentPage((p) => Math.max(0, p - 1))}
                disabled={recentPage === 0}
                style={[
                  styles.iconButton,
                  recentPage === 0 && styles.disabledIcon,
                ]}
              >
                <BackwardIcon width={24} height={24} fill="#000" />
              </TouchableOpacity>

              <Text style={{ alignSelf: "center", marginHorizontal: 12 }}>
                {recentPage + 1} / {recentTotalPages}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setRecentPage((p) => Math.min(recentTotalPages - 1, p + 1))
                }
                disabled={recentPage >= recentTotalPages - 1}
                style={[
                  styles.iconButton,
                  recentPage >= recentTotalPages - 1 && styles.disabledIcon,
                ]}
              >
                <ForwardIcon width={24} height={24} fill="#000" />
              </TouchableOpacity>
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
                    style={styles.endedContentsContainer}
                    onPress={() => {
                      setShowModal(true);
                      setSelectedArtwork(endedartwork);
                    }}
                  >
                    <ImageBackground
                      source={{ uri: endedartwork.DP_MAIN_IMG }}
                      style={styles.endedImages}
                      imageStyle={styles.backgroundImage}
                    />
                    <View style={styles.endedContents}>
                      <Text
                        style={{
                          color: "gray",
                          marginBottom: "5",
                          fontSize: "10",
                        }}
                      >
                        {formatDateKorean(endedartwork.DP_END)}까지 만날 수 있는
                        전시!
                      </Text>
                      <Text style={styles.endedNamecStyle} numberOfLines={3}>
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
            <View style={styles.artistContents}>
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
    backgroundColor: "transparent",
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
    color: "#fff",
    marginVertical: 4,
  },
  MainbackgroundImage: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
  recommandFactor: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  recommandContainer: {
    width: "100%",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    height: "auto",
    padding: 20,
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  recommandList: {
    paddingVertical: 8,
  },
  recommandCard: {
    width: 310,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: "transparent",
    padding: 10,
    overflow: "hidden",
  },
  recommandImage: {
    width: "100%",
    height: 450,
    borderRadius: 8,
  },
  recommandPart: {
    fontSize: 12,
    color: "gray",
    color: "#fff",
  },
  recommandTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#fff",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    width: "100%",
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
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
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
  },
  recentImagesS: {
    width: "50%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "white",
    margin: 5,
  },
  recentImagesL: {
    width: "40%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderRadius: 10,
    backgroundColor: "white",
  },
  recentPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 10,
    borderColor: "transparent",
    borderWidth: 1,
  },
  iconButton: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#5f5f5fff",
    borderWidth: 1,
    borderRadius: 20,
  },
  disabledIcon: {
    opacity: 0.35,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: "10",
    paddingRight: "10",
    marginTop: 10,
  },
  imageBackground: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  endedImages: {
    width: 130,
    height: 90,
  },
  endedContentsContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    height: "auto",
    display: "flex",
    marginVertical: 10,
  },
  endedContents: {
    width: "55%",
    flexDirection: "column",
    height: "auto",
    display: "flex",
    marginVertical: 5,
    marginLeft: 5,
  },
  endedNamecStyle: {
    marginVertical: 2,
    width: "50%",
    color: "#000",
    fontSize: "13",
    flexWrap: "wrap",
    display: "flex",
    width: "auto",
    fontWeight: "bold",
  },
  endedContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    height: "auto",
    padding: 20,
    marginBottom: 10,
  },

  artistContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: "#D9D9D9",
    height: "auto",
    padding: 20,
  },
  artistContents: {
    marginTop: 10,
    width: "100%",
  },
});
