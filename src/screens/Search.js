import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import React, { useEffect, useState } from "react";
import { XMLParser } from "fast-xml-parser";
import { ScrollView } from "react-native-gesture-handler";
const SERVER_URL =
  "https://apis.data.go.kr/B553457/nopenapi/rest/cultureartspaces";

export default function Search() {
  const [placeKeyword, setPlaceKeyword] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const pageNum = 1;
  const listCnt = 10;
  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/artgallery?serviceKey=${process.env.REACT_APP_API_KEY}&PageNo=${pageNum}&numOfRows=${listCnt}`,
      );

      const xmlText = await response.text();
      const jsonData = parser.parse(xmlText);

      let items = jsonData?.response?.body?.items?.item;

      // item이 하나일 경우 배열이 아닐 수 있음
      if (!Array.isArray(items)) {
        items = [items];
      }

      setSearchResult(items);
      console.log("전체 데이터:", items);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredResult = searchResult.filter((item) =>
    item.culName?.toLowerCase().includes(placeKeyword.toLowerCase()),
  );

  return (
    <View style={{ flexDirection: "column" }}>
      <View style={styles.searchbar}>
        <TextInput
          placeholder="search-bar"
          value={placeKeyword}
          onChangeText={setPlaceKeyword}
          style={{ width: "85%" }}
        />
        <Button title="검색" onPress={fetchArtworks} />
      </View>
      <View>
        {filteredResult.map((item) => (
          <Text key={item.seq}>{item.culName}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchbar: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    padding: 10,
    marginVertical: 15,
    marginHorizontal: "auto",
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    flexDirection: "row",
  },
});
