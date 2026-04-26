import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../firebase.js";
import FilterIcon from "../assets/icons/filter.svg";
import Mainlogo from "../assets/icons/logo-main.svg";
import ReloadIcon from "../assets/icons/reload.svg";
import ArtworkFilter from "../components/filter/ArtworkFilter.js";
import ArtworkInfoModal from "../components/modals/ArtworkInfoModal";
import SearchBar from "../components/search/SearchBar.js";
import { fetchArtwork } from "../services/artService.js";
import { useArtStore } from "../store/useArtStore.js";
import { colors } from "../styles/colors.js";
import { fontSize, radius, spacing } from "../styles/theme.js";
import { normalizeArtwork } from "../utils/nomalize.js";
import { parseItems } from "../utils/xmlParser.js";

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
  const getArtwork = async (nextPage = 1) => {
    if (!hasMore && nextPage !== 1) return;

    if (nextPage === 1) setLoading(true);
    else setIsFetchingMore(true);

    try {
      const xmlText = await fetchArtwork(nextPage, listCnt);
      const items = parseItems(xmlText);
      const list = Array.isArray(items) ? items : [items];
      const normalized = list.map(normalizeArtwork).filter(Boolean);

      if (list.length < listCnt) setHasMore(false);
      if (nextPage === 1) {
        setArtworks(normalized);

        applyFilter({
          start: startIndex,
          end: endIndex,
          genres: selectedGenres,
          regions: selectedRegions,
          minRating: selectedRating,
          sourceData: normalized,
        });
      } else {
        setArtworks((prev) => {
          const merged = [...prev, ...normalized];

          const uniqueMap = new Map();
          merged.forEach((item) => {
            uniqueMap.set(item.id, item);
          });

          return Array.from(uniqueMap.values());
        });
        const filteredNewItems = normalized.filter((item) => {
          let keep = true;

          if (selectedGenres.length > 0) {
            const lowered = selectedGenres.map((g) => g.toLowerCase());
            keep =
              keep &&
              lowered.some((g) =>
                String(item.raw?.serviceName || "")
                  .toLowerCase()
                  .includes(g),
              );
          }

          if (selectedRegions.length > 0) {
            const lowered = selectedRegions.map((r) => r.toLowerCase());
            keep =
              keep &&
              lowered.some((r) =>
                String(item.location?.area || "")
                  .toLowerCase()
                  .includes(r),
              );
          }

          if (selectedRating > 0) {
            const avg = avgRatingMap[item.id] || 0;
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
    sourceData,
  }) => {
    const base = sourceData ?? artworks ?? [];

    let filtered = [...base];

    if (genres.length > 0) {
      const lowered = genres.map((g) => g.toLowerCase());

      filtered = filtered.filter((item) =>
        lowered.some((g) =>
          String(item.raw?.serviceName || "")
            .toLowerCase()
            .includes(g),
        ),
      );
    }

    if (regions.length > 0) {
      const lowered = regions.map((r) => r.toLowerCase());

      filtered = filtered.filter((item) =>
        lowered.some((r) =>
          String(item.location?.area || "")
            .toLowerCase()
            .includes(r),
        ),
      );
    }

    if (minRating > 0) {
      filtered = filtered.filter((item) => {
        const avg = avgRatingMap[item.id] || 0;
        return avg >= minRating;
      });
    }

    const sliced = filtered.slice(start - 1, end);

    setDisplayedArtworks(sliced);
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
      <View style={{ padding: spacing.sm, justifyContent: "center" }}>
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
            paddingVertical: spacing.xl,
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
                  marginBottom: spacing.md,
                  color: loading ? colors.lightGray : colors.gray,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          ref={flatListRef}
          data={displayedArtworks}
          keyExtractor={(item, index) => item.id + "_" + index}
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
      <ArtworkFilter
        visible={showFilter}
        initStart={startIndex}
        initEnd={endIndex}
        onClose={() => setShowFilter(false)}
        onApply={(filters) => {
          setSelectedGenres(filters.genres);
          setSelectedRegions(filters.regions);
          setSelectedRating(filters.minRating);
          applyFilter({
            ...filters,
            sourceData: artworks,
          });
          setShowFilter(false);
        }}
        genres={[
          ...new Set(
            (artworks ?? []).map((a) => a.raw?.serviceName).filter(Boolean),
          ),
        ]}
        regions={[
          ...new Set(
            (artworks ?? []).map((a) => a.location?.area).filter(Boolean),
          ),
        ]}
      />

      <ArtworkInfoModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        artwork={selectedArtwork}
        seq={selectedArtwork?.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchbar: {
    borderColor: colors.black,
    borderWidth: 1,
    borderRadius: radius.sm,
    width: "100%",
    padding: spacing.sm,
    marginHorizontal: "auto",
    marginVertical: spacing.md,
    backgroundColor: colors.lightGray,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: fontSize.xl,
    color: colors.black,
    fontWeight: "bold",
    paddingLeft: spacing.sm,
  },
  artworks_S: {
    width: "40%",
    marginVertical: spacing.xs,
    marginHorizontal: "1%",
    padding: spacing.xs,
  },
  artworks_B: {
    width: "55%",
    marginVertical: spacing.xs,
    marginHorizontal: "1%",
    padding: spacing.xs,
  },
  ModalContainer: {
    width: "100%",
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
    marginBottom: spacing.sm,
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  backgroundImage: {
    borderRadius: radius.sm,
  },
  conditions: {
    width: "50%",
    flexDirection: "row",

    justifyContent: "flex-end",
  },
  condition: {
    fontWeight: "bold",
    marginLeft: spacing.sm,
  },
  descStyle: {
    fontSize: fontSize.xs,
    color: colors.black,
    fontWeight: "200",
    marginVertical: spacing.xs,
  },
  ArtistDescStyle: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginVertical: spacing.xs,
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
    padding: spacing.xl,
    borderRadius: radius.xs,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
  },
});
