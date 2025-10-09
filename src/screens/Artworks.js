import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  ImageBackground,
} from "react-native";
import React, { useState, useEffect } from "react";
import { parseString } from "react-native-xml2js";

// const SERVER_URL =
//   "https://apis.data.go.kr/B553457/nopenapi/rest/publicperformancedisplays";
// const API_KEY =
//   "iUshbHgoTGazZCC2/6vIBZp/B97CWSUUeLAbmBto9st2Aj33IThDavcN4Cy1W8e/dbjWYG0yBe5qU2lZ/ZlPMg==";

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

export default function Artworks() {
  const [artworks, setArtworks] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [listCnt, setListCnt] = useState(10);
  const [startIndex, setStartIndex] = useState(1);
  const [endIndex, setEndIndex] = useState(60);

  const getArtwork = async () => {
    try {
      // const response = await fetch(
      //   `${SERVER_URL}/realm?serviceKey=${API_KEY}&PageNo=${pageNum}&numOfrows=${listCnt}&place=${"서울"}&serviceTp=A`
      // );
      const response = await fetch(
        `${SERVER_URL}/${API_KEY}/xml/ListExhibitionOfSeoulMOAInfo/${parseInt(
          startIndex,
          10
        )}/${parseInt(endIndex, 10)}/`
      );

      //임시
      // http://openapi.seoul.go.kr:8088/(인증키)/xml/ListExhibitionOfSeoulMOAInfo/1/5/
      //국현미
      // https://api.kcisa.kr/openapi/service/rest/moca/docMeta?
      // serviceKey=87140534-51de-4ad2-aa86-76dc3130a321&numOfRows=10&pageNo=1

      //서울시립
      //https://api.kcisa.kr/openapi/service/rest/other/getSEMN5601?
      // serviceKey=589be839-5c41-4c36-96af-b02330050e14&numOfRows=10&pageNo=1
      const xmlText = await response.text();

      parseString(xmlText, { explicitArray: false }, (err, jsonData) => {
        if (err) return;
        let items = jsonData.ListExhibitionOfSeoulMOAInfo?.row || [];
        if (!Array.isArray(items)) items = [items];

        // items.sort((a, b) => {
        //   const getEndDate = (period) => {
        //     if (!period) return 0;
        //     const match = period.match(/~\s*([\d.]+)/);
        //     return match ? new Date(match[1].replace(/\./g, "-")) : new Date(0);
        //   };
        //   return getEndDate(b.eventPeriod) - getEndDate(a.eventPeriod);
        // });

        setArtworks(items);
      });
      console.log("items: ", items);
    } catch (error) {
      // console.error("데이터 불러오기 오류:", error);
    }
  };

  console.log("artwork: ", artworks);

  useEffect(() => {
    getArtwork();
  }, []);

  return (
    <SafeAreaView
      style={{
        width: "100%",
        marginHorizontal: "auto",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ padding: 10 }}>
          <Text
            style={{
              fontSize: 35,
              fontWeight: "bold",
              color: "#333",
              marginVertical: 15,
              marginHorizontal: "auto",
            }}
          >
            ArtMate-Logo
          </Text>
          <View style={styles.searchbar}>
            <TextInput placeholder="search-bar" />
          </View>
          <View
            style={{
              width: "100%",
              // borderColor: "black",
              // borderWidth: 1,
              marginVertical: 10,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View style={{ width: "50%" }}>
              <Text>작품 정보</Text>
            </View>
            <View style={styles.conditions}>
              <Text style={styles.condition}>필터</Text>
              <Text style={styles.condition}>새로고침</Text>
            </View>
          </View>
          <View style={styles.imageContainer}>
            {artworks.length > 0 &&
              artworks?.map((artwork, index) => (
                <View style={styles.artworks} key={index}>
                  <ImageBackground
                    source={{ uri: artwork.DP_MAIN_IMG }}
                    style={styles.imageBackground}
                    imageStyle={styles.backgroundImage}
                  />
                  <Text>{artwork.DP_NAME}</Text>

                  <Text
                    style={styles.ArtistDescStyle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {artwork.DP_ARTIST}
                  </Text>
                  <Text style={styles.descStyle}>
                    {artwork.DP_START} ~ {artwork.DP_END}
                  </Text>
                  <Text style={styles.descStyle}>{artwork.DP_PLACE}</Text>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchbar: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: "90%",
    padding: 10,
    marginHorizontal: "auto",
    marginVertical: 15,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  artworks: {
    width: "45%",
    // height: "auyo%",
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: "auto",
  },
  imageContainer: {
    width: "100%",
    // height: "100%",
    flex: 1,
    borderColor: "blue",
    borderWidth: 1,
    borderRadius: 10,
    flexWrap: "wrap",
    flexDirection: "row",
  },
  imageBackground: {
    width: "100%",
    height: "200",
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  conditions: {
    width: "50%",
    flexDirection: "row",
    // borderColor: "red",
    // borderWidth: 1,
    justifyContent: "flex-end",
  },
  condition: {
    fontWeight: "bold",
    marginLeft: 10,
  },
  descStyle: {
    fontSize: 10,
    color: "#333",
    marginVertical: 2,
  },
  ArtistDescStyle: {
    fontSize: 10,
    color: "#333",
    marginVertical: 2,
  },
});
