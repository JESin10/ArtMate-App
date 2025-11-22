import { View, Text, Button } from "react-native";
import React, { useState, useEffect } from "react";
// const SERVER_URL = "https://apis.data.go.kr/B553457/cultureinfo";
// const API_KEY =
//   "iUshbHgoTGazZCC2/6vIBZp/B97CWSUUeLAbmBto9st2Aj33IThDavcN4Cy1W8e/dbjWYG0yBe5qU2lZ/ZlPMg==";
// `${SERVER_URL}/area2?serviceKey=${API_KEY}&PageNo=${startIndex}&numOfrows=${endIndex}&sido=${city}`

//국현미
// const SERVER_URL = "https://api.kcisa.kr/openapi/service/rest/moca/docMeta";
// const API_KEY = "87140534-51de-4ad2-aa86-76dc3130a321";

//서울시립미술관
// const SERVER_URL =
//   "https://api.kcisa.kr/openapi/service/rest/other/getSEMN5601";
// const API_KEY = "589be839-5c41-4c36-96af-b02330050e14";

//임시-공공데이터
const SERVER_URL = "http://openapi.seoul.go.kr:8088";
const API_KEY = "6b44656447746c733835476551776c";

export default function Recent() {
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
          10
        )}/${parseInt(endIndex, 10)}/`
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
