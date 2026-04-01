import { View } from "react-native";
import { useState, useEffect } from "react";

export default function useRecentArtworks() {
  const [recentArtworks, setRecentArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(1);
  const [endIndex, setEndIndex] = useState(6);

  const getRecentArtWork = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${SERVER_URL}/${API_KEY}/xml/ListExhibitionOfSeoulMOAInfo/${parseInt(
          startIndex,
          10,
        )}/${parseInt(endIndex, 10)}/`,
      );

      const xmlText = await response.text();

      parseString(xmlText, { explicitArray: false }, (err, jsonData) => {
        if (err) {
          setRecentArtworks([]);
          setDisplayedArtworks([]);
          setLoading(false);
          return;
        }
        let items = jsonData.ListExhibitionOfSeoulMOAInfo?.row || [];
        // setDetailArtwork((prev) => ({ ...prev, [seq]: detail }));

        if (!Array.isArray(items)) items = [items];

        setRecentArtworks(items);
        // 기본은 전체를 표시 (필터 적용 시 applyFilter 호출)
        setLoading(false);
      });
      console.log("Recent Artworks:", recentArtworks);
    } catch (error) {
      setLoading(false);
    }
  };
  useEffect(() => {
    getRecentArtWork();
  }, [recentArtworks?.length]);

  return <View></View>;
}
