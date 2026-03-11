import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PlaceItem from "./PlaceItem";
import PlacesInfoModal from "../../components/modals/PlacesInfoModal";
import MapIcon from "../../assets/icons/location.svg";
import ReloadIcon from "../../assets/icons/reload.svg";
import Mainlogo from "../../assets/icons/logo-main.svg";
import SearchBar from "../../components/search/SearchBar";
import usePlaces from "../../components/hooks/usePlaces";

export default function PlacesScreen({ navigation }) {
  const { gallery, artworks, details, loading, isFetchingMore, loadMore } =
    usePlaces();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const renderItem = useCallback(
    ({ item }) => {
      const detail = details[item.seq];

      return (
        <PlaceItem
          item={item}
          detail={detail}
          onPress={() => {
            setSelectedPlace(item);
            setShowPopup(true);
          }}
        />
      );
    },
    [details],
  );

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

  return (
    <SafeAreaView
      style={{ width: "95%", height: "100%", marginHorizontal: "auto" }}
    >
      <View style={{ padding: 10 }}>
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
            marginVertical: 20,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>
            가까운 전시장
          </Text>

          <View style={{ flexDirection: "row" }}>
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

            <TouchableOpacity>
              <ReloadIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={gallery}
          renderItem={renderItem}
          keyExtractor={(item) => item.seq?.toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
          ListFooterComponent={
            isFetchingMore ? (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : null
          }
        />
      </View>

      <PlacesInfoModal
        visible={showPopup}
        onClose={() => {
          setShowPopup(false);
          setSelectedPlace(null);
        }}
        seq={selectedPlace?.seq}
      />

      {loading && (
        <ActivityIndicator
          size="large"
          style={{ position: "absolute", top: "50%", left: "50%" }}
        />
      )}
    </SafeAreaView>
  );
}
