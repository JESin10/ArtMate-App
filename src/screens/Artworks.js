import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  ImageBackground,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import ArtworkFilter from "../components/filter/ArtworkFilter.js";
import ArtworkInfoModal from "../components/modals/ArtworkInfoModal";
import FilterIcon from "../assets/icons/filter.svg";
import ReloadIcon from "../assets/icons/reload.svg";
import Mainlogo from "../assets/icons/logo-main.svg";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { XMLParser } from "fast-xml-parser";
import SearchBar from "../components/search/SearchBar.js";

export default function Artworks({ navigation }) {
  const [artworks, setArtworks] = useState([]); // 원본 전체
  const [displayedArtworks, setDisplayedArtworks] = useState([]); // 필터 적용된 목록
  const [loading, setLoading] = useState(false);
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
  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  useEffect(() => {
    getArtwork(1);
  }, []);

  const getArtwork = async (nextPage = 1) => {
    if (!hasMore && nextPage !== 1) return;

    if (nextPage === 1) {
      setLoading(true);
    } else setIsFetchingMore(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/area2?serviceKey=${
          process.env.REACT_APP_API_KEY
        }&PageNo=${nextPage}&numOfrows=${listCnt}`,
      );

      const xmlText = await response.text();
      const jsonData = parser.parse(xmlText);
      const rawItems = jsonData?.response?.body?.items?.item || [];
      const list = Array.isArray(rawItems) ? rawItems : [rawItems];

      if (list.length < listCnt) {
        setHasMore(false);
      }

      const normalized = list.map((it) => ({
        ...it,
        DP_SEQ: it?.seq,
        thumbnail: it?.thumbnail?.startsWith("http:")
          ? it.thumbnail.replace("http:", "https:")
          : it?.thumbnail,
      }));

      if (nextPage === 1) {
        {
          setArtworks(normalized);
          setDisplayedArtworks(normalized); // 🔥 추가
        }
      } else {
        setArtworks((prev) => [...prev, ...normalized]);
        setDisplayedArtworks((prev) => [...prev, ...normalized]); // 🔥 추가
      }

      setPageNum(nextPage);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
    setIsFetchingMore(false);
  };

  const loadMore = () => {
    if (!isFetchingMore && hasMore) {
      getArtwork(pageNum + 1);
    }
  };

  // console.log(displayedArtworks);
  // const filteredArtworks = useMemo(() => {
  //   return artworks; // 지금은 기본값, 나중에 필터 적용 가능
  // }, [artworks]);

  // parts: ['조각', ...] 형태 (부분일치, 대소문자 무시), start/end는 1-based
  const applyFilter = ({
    start = 1,
    end = 60,
    genres = [],
    regions = [],
    realmName = [],
  }) => {
    setStartIndex(start);
    setEndIndex(end);

    let source = artworks || [];

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

    // 종류 필터
    if (realmName.length > 0) {
      const lowered = realmName.map((r) => r.toLowerCase());

      source = source.filter((a) =>
        lowered.some((r) =>
          String(a.realmName || "")
            .toLowerCase()
            .includes(r),
        ),
      );
    }

    //  범위 적용
    const s = Math.max(1, start);
    const e = Math.min(source.length, end);

    setDisplayedArtworks(source.slice(s - 1, e));
  };

  const onRefresh = () => {
    if (loading) return;
    setHasMore(true);
    setPageNum(1);
    setArtworks([]);
    // set({});
    getArtwork(1);
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
          <Mainlogo width={150} height={50} />
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
          data={displayedArtworks}
          keyExtractor={(item) => item.DP_SEQ?.toString()}
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
          applyFilter(filters);
          setShowFilter(false);
        }}
        genres={[
          ...new Set(artworks.map((a) => a.serviceName).filter(Boolean)),
        ]}
        regions={[...new Set(artworks.map((a) => a.area).filter(Boolean))]}
        // realm={[...new Set(artworks.map((a) => a.realmName).filter(Boolean))]}
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
