import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker } from "react-native-maps";

export default function Map({ x, y }) {
  const defaultRegion = {
    latitude: 37.5665,
    longitude: 126.978,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  // const geo = route?.params?.region ?? defaultRegion;
  // console.log("Map Factor:", route);
  // console.log("Map route:", route);

  if (!x) {
    return (
      <View style={{ flex: 1 }}>
        <Text>지도 정보가 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: x,
          longitude: y,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: x,
            longitude: y,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        />
      </MapView>
    </View>
  );
}

// const styles = StyleSheet.create({
//   container: { flex: 1 },
// });
