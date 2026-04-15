import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  ImageBackground,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useMemo, useRef } from "react";
import ArtworkFilter from "../components/filter/ArtworkFilter.js";
import ArtworkInfoModal from "../components/modals/ArtworkInfoModal";
import FilterIcon from "../assets/icons/filter.svg";
import ReloadIcon from "../assets/icons/reload.svg";
import Mainlogo from "../assets/icons/logo-main.svg";
import { XMLParser } from "fast-xml-parser";
import SearchBar from "../components/search/SearchBar.js";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase.js";
import { fetchArtwork } from "../services/exhibitionAPI.js";
import { useArtStore } from "../store/useArtStore.js";

export default function Artworks({ navigation }) {
  const {
    artworks,
    displayedArtworks,
    loading,
    setArtworks,
    setDisplayedArtworks,
    setLoading,
  } = useArtStore();
  const [showFilter, setShowFilter] = useState(false);
  const [startIndex, setStartIndex] = useState(parseInt(1));
  const [endIndex, setEndIndex] = useState(parseInt(60));
  const [showModal, setShowModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  // const [detailArtwork, setDetailArtwork] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [pageNum, setPageNum] = useState(parseInt(1));
  const [listCnt, setListCnt] = useState(parseInt(20));
  const [reviews, setReviews] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const flatListRef = useRef(null);

  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  useEffect(() => {
    getArtwork(1);
  }, []);

  useEffect(() => {
    const reviewsRef = collection(db, "reviews");
    let q;
    //firestore는 orderBy로 정렬

    q = query(reviewsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 유저 displayName 한 번만 가져오기
      const userIds = [...new Set(data.map((r) => r.userId))];
      const displayNameMap = {};

      for (const uid of userIds) {
        try {
          const userSnap = await getDoc(doc(db, "users", uid));
          displayNameMap[uid] = userSnap.exists()
            ? {
                displayName: userSnap.data().displayName,
                photoURL: userSnap.data().photoURL || null,
              }
            : { displayName: userSnap.data().displayName, photoURL: null };
        } catch (err) {
          displayNameMap[uid] = "익명";
        }
      }

      // 리뷰 + displayName 합쳐서 상태 업데이트 (한 번만)
      const fetchReview = data.map((r) => ({
        ...r,
        displayName: displayNameMap[r.userId]?.displayName,
        photoURL: displayNameMap[r.userId]?.photoURL || null,
      }));
      setReviews(fetchReview);
    });
    return () => unsubscribe();
  }, []);

  //작품 가져오기
  // getArtwork 함수 수정 (무한 스크롤 시 필터 적용)
  const getArtwork = async (nextPage = 1) => {
    if (!hasMore && nextPage !== 1) return;

    if (nextPage === 1) setLoading(true);
    else setIsFetchingMore(true);

    try {
      const xmlText = await fetchArtwork(nextPage, listCnt);
      const jsonData = parser.parse(xmlText);

      const rawItems = jsonData?.response?.body?.items?.item || [];
      const list = Array.isArray(rawItems) ? rawItems : [rawItems];

      if (list.length < listCnt) setHasMore(false);

      const normalized = list.map((it) => ({
        ...it,
        DP_SEQ: it?.seq,
        thumbnail: it?.thumbnail?.startsWith("http:")
          ? it.thumbnail.replace("http:", "https:")
          : it?.thumbnail,
      }));

      if (nextPage === 1) {
        setArtworks(normalized);

        // 🔥 여기 핵심
        applyFilter({
          start: startIndex,
          end: endIndex,
          genres: selectedGenres,
          regions: selectedRegions,
          minRating: selectedRating,
          sourceData: normalized,
        });
      } else {
        setArtworks((prev) => [...prev, ...normalized]);

        const filteredNewItems = normalized.filter((item) => {
          let keep = true;

          if (selectedGenres.length > 0) {
            const lowered = selectedGenres.map((g) => g.toLowerCase());
            keep =
              keep &&
              lowered.some((g) =>
                String(item.serviceName || "")
                  .toLowerCase()
                  .includes(g),
              );
          }

          if (selectedRegions.length > 0) {
            const lowered = selectedRegions.map((r) => r.toLowerCase());
            keep =
              keep &&
              lowered.some((r) =>
                String(item.area || "")
                  .toLowerCase()
                  .includes(r),
              );
          }

          if (selectedRating > 0) {
            const avg = avgRatingMap[item.DP_SEQ] || 0;
            keep = keep && avg >= selectedRating;
          }

          return keep;
        });

        setDisplayedArtworks((prev) => [...prev, ...filteredNewItems]);
      }

      setPageNum(nextPage);
    } catch (error) {
      console.error("작품 불러오기 실패:", error);
    }

    setLoading(false);
    setIsFetchingMore(false);
  };

  const loadMore = () => {
    if (!isFetchingMore && hasMore) {
      getArtwork(pageNum + 1);
    }
  };

  // 작품별 평균 평점 계산
  const avgRatingMap = useMemo(() => {
    const map = {};
    reviews.forEach((r) => {
      if (!r.rating) return; // 평점 없으면 스킵
      const id = r.artworkId;
      if (!map[id]) map[id] = { sum: 0, count: 0 };
      map[id].sum += r.rating;
      map[id].count += 1;
    });

    const result = {};
    Object.keys(map).forEach((id) => {
      result[id] = map[id].count > 0 ? map[id].sum / map[id].count : 0;
    });

    return result;
  }, [reviews]);

  // parts: ['조각', ...] 형태 (부분일치, 대소문자 무시), start/end는 1-based
  // 기존 applyFilter 함수 수정
  const applyFilter = ({
    start = 1,
    end = 60,
    genres = [],
    regions = [],
    minRating = 0,
    sourceData = artworks, // 🔥 핵심
  }) => {
    setStartIndex(start);
    setEndIndex(end);

    let source = sourceData || [];

    // 장르 필터
    if (genres.length > 0) {
      const lowered = genres.map((g) => g.toLowerCase());
      source = source.filter((a) =>
        lowered.some((g) =>
          String(a.serviceName || "")
            .toLowerCase()
            .includes(g),
        ),
      );
    }

    // 지역 필터
    if (regions.length > 0) {
      const lowered = regions.map((r) => r.toLowerCase());
      source = source.filter((a) =>
        lowered.some((r) =>
          String(a.area || "")
            .toLowerCase()
            .includes(r),
        ),
      );
    }

    // 평점 필터
    if (minRating > 0) {
      source = source.filter((a) => {
        const avg = avgRatingMap[a.DP_SEQ] || 0;
        return avg >= minRating;
      });
    }

    const s = Math.max(1, start);
    const e = Math.min(source.length, end);

    setDisplayedArtworks(source.slice(s - 1, e));
  };
  const onRefresh = async () => {
    if (loading) return;

    setHasMore(true);
    setPageNum(1);

    // 🔹 필터 초기화
    setSelectedGenres([]);
    setSelectedRegions([]);
    setSelectedRating(0);
    setStartIndex(1);
    setEndIndex(60);
    setShowFilter(false);

    flatListRef.current?.scrollToOffset({
      offset: 0,
      animated: true,
    });

    // 🔹 artworks 초기화 후 데이터 가져오기
    const newArtworks = await getArtwork(1, true); // true: 새로고침용 플래그
    // 필터 초기화 상태 적용
    applyFilter({
      start: 1,
      end: 60,
      genres: [],
      regions: [],
      minRating: 0,
    });
  };

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
      {/* <ScrollView contentContainerStyle={{ flexGrow: 1 }}> */}
      <View style={{ padding: 10, justifyContent: "center" }}>
        <TouchableOpacity style={{ alignItems: "center" }}>
          <Mainlogo
            width={150}
            height={50}
            onPress={() => navigation.navigate("Bottom", { screen: "Home" })}
          />
        </TouchableOpacity>
        <SearchBar />
        <View
          style={{
            width: "100%",
            // borderColor: "black",
            // borderWidth: 1,
            paddingVertical: 20,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ width: "50%" }}>
            <Text style={styles.pageTitle}>작품 정보</Text>
          </View>
          <View style={styles.conditions}>
            <TouchableOpacity onPress={() => setShowFilter(true)}>
              <FilterIcon
                width={24}
                height={24}
                style={{ marginBottom: 12, marginHorizontal: 12 }}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onRefresh} disabled={loading}>
              <ReloadIcon
                width={24}
                height={24}
                style={{
                  marginBottom: 12,
                  color: loading ? "#999" : "#333",
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          ref={flatListRef}
          data={displayedArtworks}
          keyExtractor={(item, index) => `${item.DP_SEQ}-${index}`}
          numColumns={2}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={loading}
          onRefresh={() => {
            setHasMore(true);
            setPageNum(1);
            getArtwork(1);
          }}
          ListFooterComponent={
            isFetchingMore ? (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : null
          }
          renderItem={({ item, index }) => {
            const pos = index % 4;
            const itemStyle =
              pos === 0
                ? styles.artworks_S
                : pos === 1
                  ? styles.artworks_B
                  : pos === 2
                    ? styles.artworks_B
                    : styles.artworks_S;

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                style={itemStyle}
                onPress={() => {
                  setShowModal(true);
                  setSelectedArtwork(item);
                }}
              >
                <ImageBackground
                  source={{ uri: item.thumbnail }}
                  style={styles.imageBackground}
                  imageStyle={styles.backgroundImage}
                  resizeMode="cover"
                />
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      {/* </ScrollView> */}

      <ArtworkFilter
        visible={showFilter}
        initStart={startIndex}
        initEnd={endIndex}
        onClose={() => setShowFilter(false)}
        onApply={(filters) => {
          setSelectedGenres(filters.genres);
          setSelectedRegions(filters.regions);
          setSelectedRating(filters.minRating);

          applyFilter(filters); // 실제 필터 적용
          setShowFilter(false);
        }}
        genres={[
          ...new Set(artworks.map((a) => a.serviceName).filter(Boolean)),
        ]}
        regions={[...new Set(artworks.map((a) => a.area).filter(Boolean))]}
        // rating={[...new Set(artworks.map((a) => a.rating).filter(Boolean))]}
      />

      <ArtworkInfoModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          // setDetailArtwork([]);
          // getDetailArtwork();
        }}
        artwork={selectedArtwork}
        seq={selectedArtwork?.DP_SEQ}
      />
      {/*       
      {loading && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: "#fff", marginTop: 8 }}>로딩중...</Text>
          </View>
        </View>
      )} */}
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
  pageTitle: {
    fontSize: 22,
    color: "black",
    fontWeight: "bold",
    paddingLeft: 10,
  },
  artworks_S: {
    width: "40%",
    // borderColor: "red",
    // borderWidth: 1,
    // borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: "1%",
    padding: 8,
  },
  artworks_B: {
    width: "55%",
    // borderColor: "purple",
    // borderWidth: 1,
    // borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: "1%",
    padding: 8,
  },
  ModalContainer: {
    width: "100%",
    // borderColor: "orange",
    // borderWidth: 1,
    // borderRadius: 10,
    flex: 1,
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imageBackground: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 10,
  },
  backgroundImage: {
    borderRadius: 10,
  },
  conditions: {
    width: "50%",
    flexDirection: "row",
    // borderColor: "red",
    // borderWidth: 1,
    justifyContent: "flex-end",
  },
  condition: {
    fontWeight: "bold",
    marginLeft: 10,
  },
  descStyle: {
    fontSize: 10,
    color: "#000",
    fontWeight: "200",
    marginVertical: 4,
  },
  ArtistDescStyle: {
    fontSize: 12,
    color: "#6F6F6F",
    marginVertical: 4,
    fontWeight: "600",
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
