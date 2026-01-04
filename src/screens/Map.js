import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { WebView } from "react-native-webview"; // `expo-location` will be dynamically imported to avoid native module eval errors
import MapView, { Marker } from "react-native-maps";

const defaultRegion = {
  latitude: 37.5665,
  longitude: 126.978,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

// HTML is generated inside the component so it can use route params for center coordinates.
export default function Map({ route, navigation, x, y }) {
  const [loading, setLoading] = useState(true);

  const { region } = route?.params || defaultRegion;
  const centerLat = x ?? defaultRegion.latitude;
  const centerLng = y ?? defaultRegion.longitude;
  const [userLocation, setUserLocation] = useState(null);
  const webviewRef = useRef(null);
  console.log("Map x,y:", centerLat, centerLng);

  const html = `<html>
  <head>
    <title>Add a Map using HTML</title>

    <link rel="stylesheet" type="text/css" href="./style.css" />
    <script type="module" src="./index.js"></script>
  </head>
  <body>
    <gmp-map
      center="38.7946,-106.5348"
      zoom="14"
      map-id="884131672414"
      style="height: 400px"
    >
    </gmp-map>

    <script
      src="https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=maps"
      defer
    ></script>
  </body>
</html>
  `;

  // useEffect(() => {
  //   let mounted = true;
  //   (async () => {
  //     try {
  //       const Location = await import("expo-location");
  //       if (!Location || !Location.requestForegroundPermissionsAsync) {
  //         console.warn("expo-location not available in this environment");
  //         return;
  //       }
  //       const { status } = await Location.requestForegroundPermissionsAsync();
  //       if (status !== "granted") {
  //         console.warn("Location permission denied");
  //         return;
  //       }
  //       const pos = await Location.getCurrentPositionAsync({});
  //       const { latitude, longitude } = pos.coords;
  //       if (mounted) setUserLocation({ latitude, longitude });
  //       // inject user marker if map is already available
  //       const js = `(function(){ if(window.map){ if(window.userMarker) window.userMarker.setMap(null); window.userMarker = new naver.maps.Marker({ position: new naver.maps.LatLng(${latitude}, ${longitude}), map: window.map, title: '내 위치' }); } })(); true;`;
  //       if (webviewRef.current) webviewRef.current.injectJavaScript(js);
  //     } catch (e) {
  //       console.warn("Location error:", e);
  //     }
  //   })();
  //   return () => (mounted = false);
  // }, []);

  const centerOnUser = () => {
    if (!userLocation || !webviewRef.current) return;
    const js = `if(window.map){ window.map.setCenter(new naver.maps.LatLng(${userLocation.latitude}, ${userLocation.longitude})); if(!window.userMarker){ window.userMarker = new naver.maps.Marker({ position: new naver.maps.LatLng(${userLocation.latitude}, ${userLocation.longitude}), map: window.map, title: '내 위치' }); } } true;`;
    webviewRef.current.injectJavaScript(js);
  };

  return (
    // <View style={styles.container}>
    //   <TouchableOpacity
    //     style={styles.closeBtn}
    //     onPress={() => navigation.goBack()}
    //   >
    //     <Text style={styles.closeText}>닫기</Text>
    //   </TouchableOpacity>

    //   <TouchableOpacity style={styles.locBtn} onPress={centerOnUser}>
    //     <Text style={styles.locText}>내 위치</Text>
    //   </TouchableOpacity>

    //   {loading && (
    //     <View style={styles.loading} pointerEvents="none">
    //       <ActivityIndicator size="large" color="#608D00" />
    //       <Text style={{ marginTop: 8 }}>지도 로딩 중...</Text>
    //     </View>
    //   )}
    //   <WebView
    //     ref={webviewRef}
    //     originWhitelist={["*"]}
    //     source={{ html, baseUrl: "http://localhost:8081" }}
    //     style={styles.webview}
    //     onLoadEnd={() => setLoading(false)}
    //     javaScriptEnabled={true}
    //     domStorageEnabled={true}
    //     mixedContentMode="always"
    //     allowFileAccess
    //   />
    // </View>
    <View style={styles.container}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: defaultRegion.latitudeDelta,
          longitudeDelta: defaultRegion.longitudeDelta,
        }}
      >
        <Marker
          coordinate={{
            latitude: x,
            longitude: y,
          }}
          title="선택된 위치"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1, backgroundColor: "#fff" },
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  closeBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 16,
    zIndex: 3,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeText: { color: "#fff", fontWeight: "bold" },
  locBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 16,
    zIndex: 3,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  locText: { color: "#608D00", fontWeight: "bold" },
});
