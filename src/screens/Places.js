import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  ImageBackground,
  ActivityIndicator,
  Button,
  Touchable,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import PlacesInfoModal from "../components/modals/PlacesInfoModal.js";
import ReloadIcon from "../assets/icons/reload.svg";
import MapIcon from "../assets/icons/location.svg";
import Mainlogo from "../assets/icons/logo-main.svg";
import { XMLParser } from "fast-xml-parser";
import Search from "../components/search/SearchBar.js";
import SearchBar from "../components/search/SearchBar.js";

export default function Places({ navigation }) {
  const [gallery, setGallery] = useState([]);
  const [pageNum, setPageNum] = useState(parseInt(1));
  const [listCnt, setListCnt] = useState(parseInt(20));
  const [details, setDetails] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [artworks, setArtworks] = useState([]);

  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  useEffect(() => {
    getPlace(1);
    getArtwork();
  }, []);

  const getPlace = async (nextPage = 1) => {
    if (!hasMore && nextPage !== 1) return;

    if (nextPage === 1) setLoading(true);
    else setIsFetchingMore(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_PLACE_SERVER_URL}/artgallery?serviceKey=${process.env.REACT_APP_API_KEY}&PageNo=${nextPage}&numOfrows=${listCnt}`,
      );

      const xmlText = await response.text();
      const jsonData = parser.parse(xmlText);
      const rawItems = jsonData?.response?.body?.items?.item || [];
      const items = Array.isArray(rawItems) ? rawItems : [rawItems];

      if (items.length < listCnt) {
        setHasMore(false);
      }

      // 🔥 gallery append
      if (nextPage === 1) {
        setGallery(items);
      } else {
        setGallery((prev) => [...prev, ...items]);
      }

      // 🔥 상세 병렬 처리
      const detailPromises = items.map(async (item) => {
        try {
          const res = await fetch(
            `${process.env.REACT_APP_PLACE_SERVER_URL}/detail?serviceKey=${process.env.REACT_APP_API_KEY}&seq=${item.seq}`,
          );

          const xml = await res.text();
          const json = parser.parse(xml);

          return {
            seq: item.seq,
            detail: json?.response?.body?.items?.item,
          };
        } catch (err) {
          console.error("detail fetch error:", err);
          return null;
        }
      });

      const detailResults = await Promise.all(detailPromises);

      // 🔥 기존 details에 merge
      setDetails((prev) => {
        const newDetailMap = { ...prev };

        detailResults.forEach((result) => {
          if (result) {
            newDetailMap[result.seq] = result.detail;
          }
        });

        return newDetailMap;
      });

      setPageNum(nextPage);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
    setIsFetchingMore(false);
  };

  const loadMore = () => {
    if (!isFetchingMore && hasMore) {
      getPlace(pageNum + 1);
    }
  };

  const getArtwork = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/area2?serviceKey=${process.env.REACT_APP_API_KEY}&PageNo=1&numOfrows=40`,
      );

      const xmlText = await response.text();
      const jsonData = parser.parse(xmlText);
      const rawItems = jsonData?.response?.body?.items?.item || [];
      const list = Array.isArray(rawItems) ? rawItems : [rawItems];

      const normalized = list.map((it) => ({
        seq: it?.seq,
        title: it?.title,
        gpsX: it?.gpsX,
        gpsY: it?.gpsY,
      }));

      setArtworks(normalized);
    } catch (error) {
      console.error("artwork fetch error", error);
    }
  };

  const getCoords = (detail, item) => {
    const tryNum = (v) => {
      if (!v) return null;
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : null;
    };

    const lat = tryNum(detail?.gpsY || item?.gpsY);
    const lng = tryNum(detail?.gpsX || item?.gpsX);

    if (lat && lng) return { latitude: lat, longitude: lng };
    return null;
  };

  const openMap = () => {
    const placeMarkers = Object.entries(details)
      .map(([seq, detail]) => {
        const coords = getCoords(detail);
        if (!coords) return null;

        return {
          ...coords,
          title: detail.culName,
          seq,
          type: "place",
        };
      })
      .filter(Boolean);

    const artworkMarkers = artworks
      .map((art) => {
        const coords = getCoords(null, art);
        if (!coords) return null;

        return {
          ...coords,
          title: art.title,
          seq: art.seq,
          type: "artwork",
        };
      })
      .filter(Boolean);

    const markers = [...placeMarkers, ...artworkMarkers];
    // console.log("markers:", markers[0]);

    navigation.getParent()?.navigate("AllMap", {
      markers,
    });
  };

  const onRefresh = () => {
    if (loading) return;
    setHasMore(true);
    setPageNum(1);
    setGallery([]);
    setDetails({});
    getPlace(1);
  };

  return (
    <SafeAreaView
      style={{
        width: "95%",
        height: "100%",
        marginHorizontal: "auto",
        flexDirection: "column",
      }}
    >
      {/* <ScrollView> */}
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
            marginVertical: 20,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ width: "50%" }}>
            <Text style={styles.pageTitle}>가까운 전시장</Text>
          </View>
          <View style={styles.conditions}>
            <TouchableOpacity disabled={loading} onPress={openMap}>
              <MapIcon
                width={24}
                height={24}
                style={{
                  marginBottom: 12,
                  marginLeft: 12,
                  marginHorizontal: 12,
                }}
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
          data={gallery}
          keyExtractor={(item) => item.seq?.toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore ? (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : null
          }
          renderItem={({ item }) => {
            const detail = details[item.seq];

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.imageContainer}
                onPress={() => {
                  setSelectedPlace(item);
                  setShowPopup(true);
                }}
              >
                <View style={styles.image}>
                  {!detail ? (
                    <ActivityIndicator />
                  ) : detail?.culViewImg1 ? (
                    <ImageBackground
                      source={{
                        uri: detail.culViewImg1.replace("http", "https"),
                      }}
                      style={styles.imageBackground}
                      imageStyle={styles.tumbnail}
                    />
                  ) : (
                    <Text>No Image</Text>
                  )}
                </View>

                <View style={styles.discriptions}>
                  <Text style={styles.titleStyle}>{item.culName}</Text>
                  <Text style={styles.descStyle}>{item.culTel}</Text>
                  <Text style={styles.descStyle}>{detail?.culAddr}</Text>
                  <Text>{detail?.culGrpName}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      {/* </ScrollView> */}
      {/* 장소 클릭시 modal popup */}
      <PlacesInfoModal
        visible={showPopup}
        onClose={() => {
          setShowPopup(false);
          setSelectedPlace(null);
          // getDetailPlace();
        }}
        seq={selectedPlace?.seq}
        // detail={details[selectedPlace?.seq]}
        // detail={selectedPlace ? details[setSelectedPlace.seq] : null}
      />

      {/* 새로고침시 */}
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
    paddingLeft: 10,
  },
  discriptions: {
    width: 160,
    height: 160,
    flexDirection: "column",
    marginVertical: 10,
    marginHorizontal: "auto",
    justifyContent: "center",
    textAlign: "center",
  },
  image: {
    width: "45%",
    height: 160,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  imageContainer: {
    width: "100%",
    height: "auto",
    flexDirection: "row",
    marginBottom: 10,
  },
  imageBackground: {
    width: "auto",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tumbnail: {
    borderRadius: 10,
  },

  conditions: {
    width: "50%",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  condition: {
    fontWeight: "bold",
    marginLeft: 10,
  },
  titleStyle: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 10,
  },
  descStyle: {
    fontSize: 12,
    color: "#333",
    marginVertical: 10,
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
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
  },
  mapCloseBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 6,
  },
});
