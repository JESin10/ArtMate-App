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

const SERVER_URL =
  "https://apis.data.go.kr/B553457/nopenapi/rest/publicperformancedisplays";

const API_KEY =
  "iUshbHgoTGazZCC2/6vIBZp/B97CWSUUeLAbmBto9st2Aj33IThDavcN4Cy1W8e/dbjWYG0yBe5qU2lZ/ZlPMg==";

export default function Artworks() {
  const [artworks, setArtworks] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [listCnt, setListCnt] = useState(30);

  const getArtwork = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/realm?serviceKey=${API_KEY}&PageNo=${pageNum}&numOfrows=${listCnt}&place=${"서울"}&serviceTp=A`
      );

      const xmlText = await response.text();

      parseString(xmlText, { explicitArray: false }, (err, jsonData) => {
        if (err) {
          // console.error("XML 파싱 오류:", err);
          return;
        }
        setArtworks(jsonData.response?.body.items.item);
      });
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
                    source={{ uri: artwork.thumbnail }}
                    style={styles.imageBackground}
                    imageStyle={styles.backgroundImage}
                  />
                  <Text>{artwork.title}</Text>

                  <Text style={styles.descStyle}>
                    {artwork.startDate} ~ {artwork.endDate}
                  </Text>
                  <Text style={styles.descStyle}>{artwork.place}</Text>
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
    fontSize: 12,
    color: "#333",
    marginVertical: 2,
  },
});
