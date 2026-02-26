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

export default function Artworks() {
  const [artworks, setArtworks] = useState([]); // 원본 전체
  const [displayedArtworks, setDisplayedArtworks] = useState([]); // 필터 적용된 목록
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [startIndex, setStartIndex] = useState(parseInt(1));
  const [endIndex, setEndIndex] = useState(parseInt(60));
  const [showModal, setShowModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  // const [detailArtwork, setDetailArtwork] = useState([]);
  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  const getArtwork = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/area2?serviceKey=${
          process.env.REACT_APP_API_KEY
        }&PageNo=${parseInt(1)}&numOfrows=${parseInt(40)}`,
      );
      //  const response = await fetch(
      //         `${process.env.REACT_APP_CULTURE_URL}/request?serviceKey=${process.env.REACT_APP_CULTURE_API_KEY}&numOfRows=${parseInt(20)}&pageNo=${parseInt(1)}`,
      //       );

      const xmlText = await response.text();

      if (!xmlText || xmlText.trim().length === 0) {
        setArtworks([]);
        setDisplayedArtworks([]);
        setLoading(false);
        return;
      }

      const jsonData = parser.parse(xmlText);
      const rawItems = jsonData?.response?.body?.items?.item || [];
      const list = Array.isArray(rawItems) ? rawItems : [rawItems];

      const normalized = list.map((it) => ({
        ...it,
        seq: it?.seq,
        DP_SEQ: it?.seq,
        title: it?.title,
        DP_NAME: it?.DP_NAME,
        DP_START: it?.startDate,
        DP_END: it?.endDate,
        DP_PLACE: it?.place,
        thumbnail: it?.thumbnail?.startsWith("http:")
          ? it.thumbnail.replace("http:", "https:")
          : it?.thumbnail,
        gpsX: it?.gpsX,
        gpsY: it?.gpsY,
      }));

      setArtworks(normalized);
      setDisplayedArtworks(normalized);
    } catch (error) {
      setArtworks([]);
      setDisplayedArtworks([]);
    }

    setLoading(false);
  };

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

  useEffect(() => {
    if (selectedArtwork?.DP_SEQ) {
      getArtwork();
      // getDetailArtwork(selectedArtwork.DP_SEQ);
    } else {
      getArtwork();
    }
  }, [selectedArtwork]);

  // console.log("Artworks:", artworks);
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
              marginVertical: 10,
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

              <TouchableOpacity onPress={getArtwork} disabled={loading}>
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
          <View style={styles.ModalContainer}>
            {displayedArtworks.length > 0 &&
              displayedArtworks.map((artwork, index) => {
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
                    key={index}
                    activeOpacity={0.8}
                    style={itemStyle}
                    onPress={() => {
                      setShowModal(true);
                      setSelectedArtwork(artwork);
                      // getDetailArtwork(artwork.DP_SEQ);
                    }}
                  >
                    <ImageBackground
                      source={{ uri: artwork.thumbnail }}
                      style={styles.imageBackground}
                      imageStyle={styles.backgroundImage}
                      resizeMode="cover"
                    />
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      {artwork.title}
                    </Text>

                    <Text
                      style={styles.ArtistDescStyle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {artwork.area} {artwork.sigungu}
                    </Text>
                    <Text style={styles.descStyle}>
                      {artwork.startDate} ~ {artwork.endDate}
                    </Text>
                    <Text style={styles.descStyle}>{artwork.serviceName}</Text>
                    <Text style={styles.descStyle}>{artwork.place}</Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        </View>
      </ScrollView>

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
        realm={[...new Set(artworks.map((a) => a.realmName).filter(Boolean))]}
      />

      <ArtworkInfoModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          // setDetailArtwork([]);
          // getDetailArtwork();
        }}
        // artwork={detailArtwork}
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
