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
import { fontSize, radius, spacing } from "../../styles/theme";

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
    if (filter === "place") return item.type === "place";
    if (filter === "all") return true;
    return false;
  });

  // console.log(markers);

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

  const safeMyPins = myPins.filter(
    (pin) =>
      pin?.geoCode &&
      typeof pin.geoCode.lat === "number" &&
      typeof pin.geoCode.lng === "number",
  );

  return (
    <SafeAreaView
      style={{
        width: "95%",
        height: "100%",
        marginHorizontal: "auto",
        flexDirection: "column",
        padding: spacing.sm,
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
        <View
          style={{
            position: "absolute",
            top: spacing.sm,
            left: spacing.sm,
            zIndex: spacing.sm,
          }}
        >
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
                  pinColor={colors.pin_green}
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
                  pinColor={colors.pin_blue}
                />
              ),
            )}

          {/* 사용자 pins */}
          {/* 
          {(filter === "my" || filter === "all") &&
            myPins.map((pin) => (
              <Marker
                key={pin.seq}
                coordinate={{
                  latitude: pin.geoCode.lat,
                  longitude: pin.geoCode.lng,
                }}
                title={pin.placeName}
                pinColor={colors.pin_red}
              />
            ))} */}
          {(filter === "all" || filter === "my") &&
            safeMyPins.map((pin) => (
              <Marker
                key={`my-${pin.id}`}
                coordinate={{
                  latitude: pin.geoCode.lat,
                  longitude: pin.geoCode.lng,
                }}
                title={pin.placeName}
                pinColor={colors.pin_red}
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
    borderRadius: radius.sm,
    width: "100%",
    padding: spacing.sm,
    marginHorizontal: "auto",
    marginVertical: spacing.lg,
    backgroundColor: colors.lightGray,
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: spacing.xl,
    right: spacing.xl,
    zIndex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    borderColor: colors.black,
    borderWidth: 1,
  },
  listBtn: {
    width: 40,
    height: 40,
    position: "absolute",
    top: spacing.xxxl,
    right: spacing.xl,
    zIndex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderColor: colors.lightGray,
    borderWidth: 1,
  },
  zoomInBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: spacing.xl,
    left: spacing.xl,
    zIndex: 1,
    backgroundColor: colors.white,
    borderTopRightRadius: spacing.md,
    borderTopLeftRadius: spacing.md,
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
    left: spacing.xl,
    zIndex: 1,
    backgroundColor: colors.white,
    borderBottomRightRadius: spacing.md,
    borderBottomLeftRadius: spacing.md,
    borderColor: colors.lightGray,
    borderWidth: 1,
  },
  zoomInText: {
    fontSize: fontSize.md,
  },
  zoomOutText: {
    justifyContent: "center",
    alignItems: "center",
    fontSize: fontSize.md,
  },
  closeText: { color: colors.black, fontWeight: "bold" },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.sm,
  },
  filterBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.md,
  },
  activeFilterBtn: {
    backgroundColor: colors.primary, // 클릭된 버튼 색
  },
  activeFilterText: {
    color: colors.white, // 클릭된 버튼 텍스트 색
    fontWeight: "bold",
  },
});
