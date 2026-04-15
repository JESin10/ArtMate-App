import { useEffect, useState } from "react";
import { XMLParser } from "fast-xml-parser";
import * as Location from "expo-location";
import { fetchDetailPlace, fetchPlace } from "../services/placeeAPI";
import { fetchArtwork } from "../services/exhibitionAPI";

export default function usePlaces() {
  const [gallery, setGallery] = useState([]);
  const [details, setDetails] = useState({});
  const [artworks, setArtworks] = useState([]);
  const [pageNum, setPageNum] = useState(1);

  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [userLocation, setUserLocation] = useState(null);

  const listCnt = 20;

  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    setGallery((prev) => sortByDistance(prev, userLocation));
  }, [userLocation]);

  const init = async () => {
    getUserLocation();
    getPlace(1);
    getArtwork();
  };

  // 현재 위치 가져오기
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("위치 권한 거부됨");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      setUserLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    } catch (error) {
      console.error("위치 가져오기 실패:", error);
    }
  };

  // 거리 계산 (Haversine)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // 거리 기준 정렬
  const sortByDistance = (places, location) => {
    if (!location) return places;

    return [...places]
      .map((place) => {
        if (!place.gpsX || !place.gpsY) {
          return { ...place, distance: Infinity };
        }

        const distance = getDistance(
          location.lat,
          location.lng,
          Number(place.gpsY),
          Number(place.gpsX),
        );

        return {
          ...place,
          distance,
        };
      })
      .sort((a, b) => a.distance - b.distance);
  };

  // 장소 목록 가져오기
  const getPlace = async (nextPage = 1) => {
    if (!hasMore && nextPage !== 1) return;

    if (nextPage === 1) {
      setHasMore(true);
      setLoading(true);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const xmlText = await fetchPlace(nextPage, listCnt);
      const jsonData = parser.parse(xmlText);

      const rawItems = jsonData?.response?.body?.items?.item || [];
      const items = Array.isArray(rawItems) ? rawItems : [rawItems];

      if (items.length < listCnt) setHasMore(false);

      const sortedItems = sortByDistance(items, userLocation);

      if (nextPage === 1) {
        setGallery(sortedItems);
      } else {
        setGallery((prev) => [...prev, ...sortedItems]);
      }

      // detail API 병렬 호출
      const detailPromises = items.map(async (item) => {
        try {
          const xmlText = await fetchDetailPlace(item.seq);
          const json = parser.parse(xmlText);

          return {
            seq: item.seq,
            detail: json?.response?.body?.items?.item,
          };
        } catch (err) {
          console.error("detail fetch 실패:", err);
          return null;
        }
      });

      const results = await Promise.all(detailPromises);

      setDetails((prev) => {
        const newMap = { ...prev };

        results.forEach((r) => {
          if (r) newMap[r.seq] = r.detail;
        });

        return newMap;
      });

      setPageNum(nextPage);
    } catch (error) {
      console.error("place fetch 실패:", error);
    }

    setLoading(false);
    setIsFetchingMore(false);
  };

  const loadMore = () => {
    if (!isFetchingMore && hasMore) {
      getPlace(pageNum + 1);
    }
  };

  // 작품 데이터
  const getArtwork = async () => {
    try {
      const xmlText = await fetchArtwork(1, 40);
      const jsonData = parser.parse(xmlText);

      const rawItems = jsonData?.response?.body?.items?.item || [];
      const list = Array.isArray(rawItems) ? rawItems : [rawItems];

      const normalized = list.map((it) => ({
        seq: it?.seq,
        title: it?.title,
        gpsX: it?.gpsX,
        gpsY: it?.gpsY,
      }));

      setArtworks(normalized);
    } catch (error) {
      console.error("artwork fetch 실패:", error);
    }
  };

  const fetchPlaces = async () => {
    await getPlace(1);
  };

  return {
    gallery,
    artworks,
    details,
    loading,
    isFetchingMore,
    loadMore,
    fetchPlaces,
    userLocation,
  };
}
