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
import { parseString } from "react-native-xml2js";
import ArtworkFilter from "../components/ArtworkFilter";
import ArtworkInfoModal from "../components/ArtworkInfoModal";
import FilterIcon from "../assets/icons/filter.svg";
import ReloadIcon from "../assets/icons/reload.svg";
import Mainlogo from "../assets/icons/logo-main.svg";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const SERVER_URL = "https://apis.data.go.kr/B553457/cultureinfo";
// `${SERVER_URL}/area2?serviceKey=${API_KEY}&PageNo=${startIndex}&numOfrows=${endIndex}&sido=${city}`

//국현미
// const SERVER_URL = "https://api.kcisa.kr/openapi/service/rest/moca/docMeta";
// const API_KEY = "87140534-51de-4ad2-aa86-76dc3130a321";

//서울시립미술관
// const SERVER_URL =
//   "https://api.kcisa.kr/openapi/service/rest/other/getSEMN5601";
// const API_KEY = "589be839-5c41-4c36-96af-b02330050e14";

//임시-공공데이터
// const SERVER_URL = "http://openapi.seoul.go.kr:8088";
// const API_KEY = "6b44656447746c733835476551776c";

export default function Artworks() {
  const [artworks, setArtworks] = useState([]); // 원본 전체
  const [displayedArtworks, setDisplayedArtworks] = useState([]); // 필터 적용된 목록
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [startIndex, setStartIndex] = useState(parseInt(1));
  const [endIndex, setEndIndex] = useState(parseInt(20));
  const [showModal, setShowModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [detailArtwork, setDetailArtwork] = useState([]);

  const getArtwork = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/area2?serviceKey=${
          process.env.REACT_APP_API_KEY
        }&PageNo=${parseInt(1)}&numOfrows=${parseInt(20)}`
      );

      const xmlText = await response.text();

      parseString(xmlText, { explicitArray: false }, (err, jsonData) => {
        if (err) {
          setArtworks([]);
          setDisplayedArtworks([]);
          setLoading(false);
          return;
        }
        console.log("getArtwork xml parsed keys:", Object.keys(jsonData || {}));
        // API 응답 구조: response.body.items.item
        const rawItems = jsonData?.response?.body?.items?.item || [];
        const list = Array.isArray(rawItems) ? rawItems : [rawItems];

        // 정규화된 형태로 매핑 (필요한 필드 사용)
        const normalized = list.map((it) => ({
          // keep original keys for compatibility, plus DP_* aliases used elsewhere
          ...it,
          seq: it.seq,
          DP_SEQ: it.seq,
          title: it.title,
          DP_NAME: it.DP_NAME,
          DP_START: it.startDate,
          DP_END: it.endDate,
          DP_PLACE: it.place,
          thumbnail: it.thumbnail?.startsWith("http:")
            ? it.thumbnail.replace("http:", "https:")
            : it.thumbnail,
          gpsX: it.gpsX,
          gpsY: it.gpsY,
        }));

        setArtworks(normalized);
        // 기본은 전체를 표시 (필터 적용 시 applyFilter 호출)
        setDisplayedArtworks(normalized);
        setLoading(false);
      });
    } catch (error) {
      setLoading(false);
    }
  };

  // parts: ['조각', ...] 형태 (부분일치, 대소문자 무시), start/end는 1-based
  const applyFilter = ({ start = 1, end = 60, parts = [] }) => {
    setStartIndex(start);
    setEndIndex(end);
    let source = artworks || [];
    // 부분일치: selected parts 중 하나라도 포함하면 통과
    if (Array.isArray(parts) && parts.length > 0) {
      const lowered = parts.map((p) => String(p).toLowerCase());
      source = source.filter((a) =>
        lowered.some((p) =>
          String(a.serviceName || "")
            .toLowerCase()
            .includes(p)
        )
      );
    }
    // start/end 범위 적용 (안정성: 1-based)
    const s = Math.max(1, start);
    const e = Math.min(source.length, end);
    setDisplayedArtworks(source.slice(s - 1, e));
  };

  const getDetailArtwork = async (seq) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/detail2?serviceKey=${process.env.REACT_APP_API_KEY}&seq=${seq}`
      );

      const xmlText = await response.text();
      console.log("getDetailArtwork: API 응답 XML:", xmlText);

      parseString(xmlText, { explicitArray: false }, (err, jsonData) => {
        if (err) {
          console.error("getDetailArtwork: XML 파싱 오류:", err);
          setDetailArtwork([]);
          return;
        }

        const detail = jsonData?.response?.body?.items?.item || null;

        setDetailArtwork(detail);
        // console.log("getDetailArtwork: 파싱된 데이터:", detail);
      });
    } catch (error) {
      console.error("getDetailArtwork: API 호출 오류:", error);
      setDetailArtwork([]);
    }
  };

  useEffect(() => {
    if (selectedArtwork?.DP_SEQ) {
      getArtwork();
      getDetailArtwork(selectedArtwork.DP_SEQ);
    } else {
      getArtwork();
    }
  }, [selectedArtwork]);

  // console.log("Artworks:", detailArtwork);
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
          <View style={styles.searchbar}>
            <TextInput placeholder="search-bar" />
          </View>
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
                      getDetailArtwork(artwork.DP_SEQ);
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
        parts={[...new Set(artworks.map((a) => a.DP_ART_PART).filter(Boolean))]}
      />
      <ArtworkInfoModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setDetailArtwork([]);
          getDetailArtwork();
        }}
        artwork={detailArtwork}
        seq={selectedArtwork?.DP_SEQ}
      />

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
