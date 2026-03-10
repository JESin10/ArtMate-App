import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import Mainlogo from "../assets/icons/logo-main.svg";
import ListIcon from "../assets/icons/list.svg";
import React, { useState, useRef, useEffect, useContext } from "react";
import * as Location from "expo-location";
import { AuthContext } from "../services/context";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function AllMap({ route, navigation }) {
  const markers = route?.params?.markers ?? [];
  const mapRef = useRef(null);
  const [latDelta, setLatDelta] = useState(0.1);
  const [lngDelta, setLngDelta] = useState(0.1);
  const [region, setRegion] = useState(initialRegion);
  const [myPins, setMyPins] = useState([]);
  const { user } = useContext(AuthContext);

  const initialRegion =
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
        };

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

  console.log("myPins:", myPins);

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
      }}
    >
      <TouchableOpacity style={{ alignItems: "center" }}>
        <Mainlogo width={150} height={50} />
      </TouchableOpacity>
      <View style={styles.searchbar}>
        <TextInput placeholder="search-bar" />
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
          {/* API artworks */}
          {markers.map((item) =>
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
          {myPins.map((pin) => (
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
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderColor: "#000",
    borderWidth: 1,
  },
  listBtn: {
    width: 40,
    height: 40,
    position: "absolute",
    top: 30,
    right: 20,
    zIndex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    borderColor: "#ccccccff",
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
    backgroundColor: "#fff",
    borderTopRightRadius: 13,
    borderTopLeftRadius: 13,
    borderColor: "#ccccccff",
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
    backgroundColor: "#fff",
    borderBottomRightRadius: 13,
    borderBottomLeftRadius: 13,
    borderColor: "#ccccccff",
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
  closeText: { color: "#000", fontWeight: "bold" },
});
