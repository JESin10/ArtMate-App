import * as Location from "expo-location";
import { collection, getDocs } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../firebase";
import ListIcon from "../../assets/icons/list.svg";
import Mainlogo from "../../assets/icons/logo-main.svg";
import SearchBar from "../../components/search/SearchBar";
import { AuthContext } from "../../store/context";
import { useUserStore } from "../../store/useUserStore";
import { colors } from "../../styles/colors";

export default function AllMap({ route, navigation }) {
  const markers = route?.params?.markers ?? [];
  const mapRef = useRef(null);
  const { myPins, setMyPins } = useUserStore();
  const [latDelta, setLatDelta] = useState(0.1);
  const [lngDelta, setLngDelta] = useState(0.1);
  const [region, setRegion] = useState(
    markers.length > 0
      ? {
          latitude: markers[0].latitude,
          longitude: markers[0].longitude,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        }
      : {
          latitude: 37.523909379,
          longitude: 126.98032998,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        },
  );
  const { user } = useContext(AuthContext);
  const [filter, setFilter] = useState("all"); // all | artwork | place | my
  const filteredMarkers = markers.filter((item) => {
    if (filter === "artwork") return item.type === "artwork";
    if (filter === "place") return item.type !== "artwork";
    return true;
  });

  useEffect(() => {
    const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("위치 권한 거부됨");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      setRegion(newRegion);

      mapRef.current?.animateToRegion(newRegion, 1000);
    };

    getCurrentLocation();
  }, []);

  //pin가져오기
  useEffect(() => {
    if (!user) return;

    const checkBookmark = async () => {
      try {
        const pinsRef = collection(db, "users", user.uid, "pins");
        const snapshot = await getDocs(pinsRef);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMyPins(data);
      } catch (err) {
        console.error("Bookmark check error:", err);
        setMyPins([]);
      }
    };

    checkBookmark();
  }, [user?.uid]);

  const zoomIn = () => {
    setRegion((prev) => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta * 0.5,
      longitudeDelta: prev.longitudeDelta * 0.5,
    }));
  };

  const zoomOut = () => {
    setRegion((prev) => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta * 2,
      longitudeDelta: prev.longitudeDelta * 2,
    }));
  };

  return (
    <SafeAreaView
      style={{
        width: "95%",
        height: "100%",
        marginHorizontal: "auto",
        flexDirection: "column",
        padding: 10,
        justifyContent: "center",
      }}
    >
      <TouchableOpacity style={{ alignItems: "center" }}>
        <Mainlogo
          width={150}
          height={50}
          onPress={() => navigation.navigate("Bottom", { screen: "Home" })}
        />
      </TouchableOpacity>
      <SearchBar />
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setFilter("artwork")}
          style={[
            styles.filterBtn,
            filter === "artwork" && styles.activeFilterBtn,
          ]}
        >
          <Text style={filter === "artwork" ? styles.activeFilterText : null}>
            작품
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter("place")}
          style={[
            styles.filterBtn,
            filter === "place" && styles.activeFilterBtn,
          ]}
        >
          <Text style={filter === "place" ? styles.activeFilterText : null}>
            장소
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (!user) {
              Alert.alert(
                "안내",
                "내 장소 기능은 로그인 후 사용할 수 있습니다.",
                [{ text: "확인" }],
              );
              return;
            }
            setFilter("my");
          }}
          style={[styles.filterBtn, filter === "my" && styles.activeFilterBtn]}
        >
          <Text style={filter === "my" ? styles.activeFilterText : null}>
            내 장소
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter("all")}
          style={[styles.filterBtn, filter === "all" && styles.activeFilterBtn]}
        >
          <Text style={filter === "all" ? styles.activeFilterText : null}>
            전체
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
          <TouchableOpacity style={styles.zoomInBtn} onPress={zoomIn}>
            <Text style={styles.zoomInText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomOutBtn} onPress={zoomOut}>
            <Text style={styles.zoomOutText}>-</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.listBtn}
          onPress={() => navigation.goBack()}
        >
          <ListIcon width={20} height={20} />
        </TouchableOpacity>

        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          region={region}
          showsUserLocation={true}
        >
          {filter !== "my" &&
            filteredMarkers.map((item) =>
              //API artworks
              item.type === "artwork" ? (
                <Marker
                  key={item.seq}
                  coordinate={{
                    latitude: item.latitude,
                    longitude: item.longitude,
                  }}
                  title={item.title}
                  pinColor="green"
                />
              ) : (
                //API place
                <Marker
                  key={item.seq}
                  coordinate={{
                    latitude: item.latitude,
                    longitude: item.longitude,
                  }}
                  title={item.title}
                  pinColor="blue"
                />
              ),
            )}
          {/* 사용자 pins */}

          {(filter === "my" || filter === "all") &&
            myPins.map((pin) => (
              <Marker
                key={pin.seq}
                coordinate={{
                  latitude: pin.geoCode.lat,
                  longitude: pin.geoCode.lng,
                }}
                title={pin.placeName}
                pinColor="red"
              />
            ))}
        </MapView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, height: "90%" },
  searchbar: {
    borderColor: colors.black,
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    padding: 10,
    marginHorizontal: "auto",
    marginVertical: 15,
    backgroundColor: colors.lightGray,
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderColor: colors.black,
    borderWidth: 1,
  },
  listBtn: {
    width: 40,
    height: 40,
    position: "absolute",
    top: 30,
    right: 20,
    zIndex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    borderColor: colors.lightGray,
    borderWidth: 1,
  },
  zoomInBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
    backgroundColor: colors.white,
    borderTopRightRadius: 13,
    borderTopLeftRadius: 13,
    borderColor: colors.lightGray,
    borderBottomWidth: 0,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  zoomOutBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
    backgroundColor: colors.white,
    borderBottomRightRadius: 13,
    borderBottomLeftRadius: 13,
    borderColor: colors.lightGray,
    borderWidth: 1,
  },
  zoomInText: {
    fontSize: 20,
  },
  zoomOutText: {
    justifyContent: "center",
    alignItems: "center",
    fontSize: 20,
  },
  closeText: { color: colors.black, fontWeight: "bold" },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: colors.white,
    borderRadius: 20,
  },
  activeFilterBtn: {
    backgroundColor: colors.primary, // 클릭된 버튼 색
  },
  activeFilterText: {
    color: colors.white, // 클릭된 버튼 텍스트 색
    fontWeight: "bold",
  },
});
