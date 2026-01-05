import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Mainlogo from "../assets/icons/logo-main.svg";
import ListIcon from "../assets/icons/list.svg";
import React, { useState, useRef } from "react";

export default function AllMap({ route, navigation }) {
  const markers = route?.params?.markers ?? [];
  const mapRef = useRef(null);
  const [latDelta, setLatDelta] = useState(0.1);
  const [lngDelta, setLngDelta] = useState(0.1);

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

  const [region, setRegion] = useState(initialRegion);

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
        <MapView ref={mapRef} style={{ flex: 1 }} region={region}>
          {markers.map((marker) => (
            <Marker
              key={marker.seq}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title}
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
