import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  ImageBackground,
  ActivityIndicator,
  Button,
  Touchable,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
// import { XMLParser } from "fast-xml-parser";
// import Config from "react-native-config";
import Constants from "expo-constants";
import { parseString } from "react-native-xml2js";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import PlacesInfoModal from "../components/PlacesInfoModal";
import ReloadIcon from "../assets/icons/reload.svg";
import MapIcon from "../assets/icons/location.svg";
import Mainlogo from "../assets/icons/logo-main.svg";

const SERVER_URL =
  "https://apis.data.go.kr/B553457/nopenapi/rest/cultureartspaces";

const API_KEY =
  "iUshbHgoTGazZCC2%2F6vIBZp%2FB97CWSUUeLAbmBto9st2Aj33IThDavcN4Cy1W8e%2FdbjWYG0yBe5qU2lZ%2FZlPMg%3D%3D";

// "iUshbHgoTGazZCC2/6vIBZp/B97CWSUUeLAbmBto9st2Aj33IThDavcN4Cy1W8e/dbjWYG0yBe5qU2lZ/ZlPMg==";
export default function Places() {
  const [gallery, setGallery] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [listCnt, setListCnt] = useState(10);
  const [details, setDetails] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [showMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);

  const getDetailPlace = async (seq) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${SERVER_URL}/detail?serviceKey=${API_KEY}&seq=${seq}`
      );
      const xmlText = await response.text();
      parseString(xmlText, { explicitArray: false }, (err, jsonData) => {
        if (err) {
          setLoading(false);
          return;
        }
        const detail = jsonData.response?.body.items.item;
        setDetails((prev) => ({ ...prev, [seq]: detail }));
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("상세 정보 오류:", error);
    }
  };

  const getPlace = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${SERVER_URL}/artgallery?serviceKey=${API_KEY}&PageNo=${pageNum}&numOfrows=${listCnt}`
      );
      const xmlText = await response.text();

      parseString(xmlText, { explicitArray: false }, async (err, jsonData) => {
        if (err) return;
        setLoading(false);
        const items = jsonData.response.body.items.item;
        setGallery(items);

        const detailPromises = items.map((item) => getDetailPlace(item.seq));
        await Promise.all(detailPromises); // 모든 상세 정보 요청을 기다림
        // items.forEach((item) => {
        //   getDetailPlace(item.seq); // 각 seq에 대해 상세 정보 요청
        // });
        setLoading(false);
      });
    } catch (error) {
      setLoading(false);
      console.error("목록 불러오기 오류:", error);
    }
  };

  const getCoords = (detail, item) => {
    const tryNum = (v) => {
      if (!v) return null;
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : null;
    };
    const latKeys = [
      detail?.lat,
      detail?.latitude,
      detail?.gpsY,
      detail?.mapY,
      detail?.y,
      detail?.CUL_LAT,
      item?.lat,
    ];
    const lngKeys = [
      detail?.lng,
      detail?.longitude,
      detail?.gpsX,
      detail?.mapX,
      detail?.x,
      detail?.CUL_LON,
      item?.lng,
    ];
    const lat = tryNum(latKeys.find(Boolean));
    const lng = tryNum(lngKeys.find(Boolean));
    if (lat && lng) return { latitude: lat, longitude: lng };
    return null;
  };

  const openMap = () => {
    // 중심 좌표: 첫 번째 유효 좌표 사용
    let center = null;
    for (let i = 0; i < gallery.length; i++) {
      const item = gallery[i];
      const detail = details[item.seq];
      const c = getCoords(detail, item);
      if (c) {
        center = c;
        break;
      }
    }
    if (!center) {
      // 기본값(서울 중심)
      center = { latitude: 37.5665, longitude: 126.978 };
    }
    setMapRegion({
      ...center,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
    setShowMap(true);
  };

  useEffect(() => {
    getPlace();
    // getDetailPlace();
  }, []);
  // console.log("Gallery: ", gallery);
  // console.log("details: ", details);

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
        <View style={{ padding: 10 }}>
          {/* <Text
            style={{
              fontSize: 35,
              fontWeight: "bold",
              color: "#333",
              marginVertical: 15,
              marginHorizontal: "auto",
            }}
          >
            ArtMate-Logo
          </Text> */}
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
              <Text style={styles.pageTitle}>가까운 전시장</Text>
            </View>
            <View style={styles.conditions}>
              <TouchableOpacity onPress={getPlace} disabled={loading}>
                <ReloadIcon
                  width={24}
                  height={24}
                  style={{
                    marginBottom: 12,
                    color: loading ? "#999" : "#333",
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={openMap} disabled={loading}>
                <MapIcon
                  width={24}
                  height={24}
                  style={{
                    marginBottom: 12,
                    marginLeft: 12,
                  }}
                />
              </TouchableOpacity>
              {/* <Button
                title="지도변환"
                color="#333"
                onPress={openMap}
                disabled={loading}
              /> */}
            </View>
          </View>
          <View style={{ flexDirection: "column" }}>
            {gallery?.map((item, index) => {
              const detail = details[item.seq]; // 매칭된 상세 정보
              return (
                // <View
                //   title="Place"
                //   key={index}
                //   style={styles.imageContainer}
                //   onPress={() => setShowPopup(true)}
                // >
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  style={styles.imageContainer}
                  onPress={() => {
                    setSelectedPlace(item);
                    if (!details[item.seq]) getDetailPlace(item.seq);
                    setShowPopup(true);
                  }}
                >
                  <View style={styles.image}>
                    {detail?.culViewImg1 ? (
                      <ImageBackground
                        source={{ uri: detail.culViewImg1 }}
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
                    {/* <Text>{detail.culCont}</Text> */}

                    {/* <Text>distance</Text> */}
                  </View>
                </TouchableOpacity>
                // </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
      {/* 장소 클릭시 modal popup */}
      <PlacesInfoModal
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        item={selectedPlace}
        detail={details[selectedPlace?.seq]}
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

      {/* 지도클릭시 */}
      {showMap && mapRegion && (
        <View style={styles.mapOverlay}>
          <TouchableOpacity
            style={styles.mapCloseBtn}
            onPress={() => setShowMap(false)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>닫기</Text>
          </TouchableOpacity>
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
