import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapIcon from "../../assets/icons/location.svg";
import Mainlogo from "../../assets/icons/logo-main.svg";
import ReloadIcon from "../../assets/icons/reload.svg";
import PlacesInfoModal from "../../components/modals/PlacesInfoModal";
import PlaceItem from "../../components/places/PlaceItem";
import SearchBar from "../../components/search/SearchBar";
import usePlaces from "../../hooks/usePlaces";
import { useArtStore } from "../../store/useArtStore";
import { fontSize, spacing } from "../../styles/theme";

export default function PlacesScreen({ navigation }) {
  const {
    gallery,
    details,
    loading,
    isFetchingMore,
    loadMore,
    fetchPlaces,
    userLocation,
  } = usePlaces();
  const artworks = useArtStore((state) => state.artworks);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const flatListRef = useRef(null);
  const renderItem = useCallback(
    ({ item }) => {
      const detail = details?.[item.seq] ?? null;

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

  const onRefresh = async () => {
    if (loading) return;

    await fetchPlaces(); // 🔥 데이터 다시 가져오기

    flatListRef.current?.scrollToOffset({
      offset: 0,
      animated: true,
    });
  };
  return (
    <SafeAreaView
      style={{ width: "95%", height: "100%", marginHorizontal: "auto" }}
    >
      <View style={{ padding: spacing.sm }}>
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
            marginVertical: spacing.xl,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: fontSize.xl, fontWeight: "bold" }}>
            가까운 전시장
          </Text>

          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity disabled={loading} onPress={openMap}>
              <MapIcon
                width={24}
                height={24}
                style={{
                  marginBottom: spacing.md,
                  marginLeft: spacing.md,
                  marginHorizontal: spacing.md,
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={onRefresh}>
              <ReloadIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={gallery}
          renderItem={renderItem}
          keyExtractor={(item) => item.seq}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
          ListFooterComponent={
            isFetchingMore ? (
              <ActivityIndicator style={{ marginVertical: spacing.xl }} />
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
