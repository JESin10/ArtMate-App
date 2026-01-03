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

const NAVER_CLIENT_ID = "udkk714yfp";

// HTML is generated inside the component so it can use route params for center coordinates.

export default function MapView({ route, navigation }) {
  const [loading, setLoading] = useState(true);
  const region = route?.params?.region;
  const centerLat = region?.latitude ?? 37.5665;
  const centerLng = region?.longitude ?? 126.978;
  const [userLocation, setUserLocation] = useState(null);
  const webviewRef = useRef(null);

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0" />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; }
      #map { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_CLIENT_ID}"></script>
    <script>
      var map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(${centerLat}, ${centerLng}),
        zoom: 13,
        zoomControl: true
      });
      var marker = new naver.maps.Marker({ position: new naver.maps.LatLng(${centerLat}, ${centerLng}), map: map });
      window.map = map;
      window.userMarker = null;
    </script>
  </body>
</html>`;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const Location = await import("expo-location");
        if (!Location || !Location.requestForegroundPermissionsAsync) {
          console.warn("expo-location not available in this environment");
          return;
        }
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Location permission denied");
          return;
        }
        const pos = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = pos.coords;
        if (mounted) setUserLocation({ latitude, longitude });
        // inject user marker if map is already available
        const js = `(function(){ if(window.map){ if(window.userMarker) window.userMarker.setMap(null); window.userMarker = new naver.maps.Marker({ position: new naver.maps.LatLng(${latitude}, ${longitude}), map: window.map, title: '내 위치' }); } })(); true;`;
        if (webviewRef.current) webviewRef.current.injectJavaScript(js);
      } catch (e) {
        console.warn("Location error:", e);
      }
    })();
    return () => (mounted = false);
  }, []);

  const centerOnUser = () => {
    if (!userLocation || !webviewRef.current) return;
    const js = `if(window.map){ window.map.setCenter(new naver.maps.LatLng(${userLocation.latitude}, ${userLocation.longitude})); if(!window.userMarker){ window.userMarker = new naver.maps.Marker({ position: new naver.maps.LatLng(${userLocation.latitude}, ${userLocation.longitude}), map: window.map, title: '내 위치' }); } } true;`;
    webviewRef.current.injectJavaScript(js);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeText}>닫기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.locBtn} onPress={centerOnUser}>
        <Text style={styles.locText}>내 위치</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator size="large" color="#608D00" />
          <Text style={{ marginTop: 8 }}>지도 로딩 중...</Text>
        </View>
      )}
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html, baseUrl: "http://localhost:8081" }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        allowFileAccess
      />
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
