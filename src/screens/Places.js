import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState } from "react";
// import { XMLParser } from "fast-xml-parser";
// import Config from "react-native-config";
import Constants from "expo-constants";
import { parseString } from "react-native-xml2js";

const SERVER_URL =
  "https://apis.data.go.kr/B553457/nopenapi/rest/cultureartspaces";

const API_KEY =
  "iUshbHgoTGazZCC2%2F6vIBZp%2FB97CWSUUeLAbmBto9st2Aj33IThDavcN4Cy1W8e%2FdbjWYG0yBe5qU2lZ%2FZlPMg%3D%3D";

// "iUshbHgoTGazZCC2/6vIBZp/B97CWSUUeLAbmBto9st2Aj33IThDavcN4Cy1W8e/dbjWYG0yBe5qU2lZ/ZlPMg==";
export default function Places() {
  const [gallery, setGallery] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [listCnt, setListCnt] = useState(10);
  const [details, setDetails] = useState({});

  const getDetailPlace = async (seq) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/detail?serviceKey=${API_KEY}&seq=${seq}`
      );
      const xmlText = await response.text();
      parseString(xmlText, { explicitArray: false }, (err, jsonData) => {
        if (err) return;
        const detail = jsonData.response?.body.items.item;
        setDetails((prev) => ({ ...prev, [seq]: detail }));
      });
    } catch (error) {
      console.error("상세 정보 오류:", error);
    }
  };

  const getPlace = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/artgallery?serviceKey=${API_KEY}&PageNo=${pageNum}&numOfrows=${listCnt}`
      );
      const xmlText = await response.text();

      parseString(xmlText, { explicitArray: false }, (err, jsonData) => {
        if (err) return;
        const items = jsonData.response.body.items.item;
        setGallery(items);
        items.forEach((item) => {
          getDetailPlace(item.seq); // 각 seq에 대해 상세 정보 요청
        });
      });
    } catch (error) {
      console.error("목록 불러오기 오류:", error);
    }
  };

  useEffect(() => {
    getPlace();
    getDetailPlace();
  }, []);
  console.log("gallery: ", gallery);
  console.log("details: ", details);

  return (
    <SafeAreaView
      style={{
        width: "100%",
        height: "100%",
        marginHorizontal: "auto",
        flexDirection: "column",
      }}
    >
      <ScrollView>
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
              <Text>가까운 전시장</Text>
            </View>
            <View style={styles.conditions}>
              <Text style={styles.condition}>새로고침</Text>
              <Text style={styles.condition}>지도변환</Text>
            </View>
          </View>
          <View style={{ flexDirection: "column" }}>
            {gallery?.map((item, index) => {
              const detail = details[item.seq]; // 매칭된 상세 정보
              return (
                <View key={index} style={styles.imageContainer}>
                  <View style={styles.image}>
                    {detail?.culViewImg1 ? (
                      <ImageBackground
                        source={{ uri: detail.culViewImg1 }}
                        style={styles.imageBackground}
                        imageStyle={styles.tumbnail}
                      />
                    ) : (
                      <Text>No Image</Text>
                    )}
                  </View>
                  <View style={styles.discriptions}>
                    <Text style={styles.titleStyle}>{item.culName}</Text>
                    <Text style={styles.descStyle}>{item.culTel}</Text>
                    <Text style={styles.descStyle}>{detail?.culAddr}</Text>
                    {/* <Text>{detail.culCont}</Text> */}

                    {/* <Text>distance</Text> */}
                  </View>
                </View>
              );
            })}
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
  discriptions: {
    width: "46%",
    height: 200,
    flexDirection: "column",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: "auto",
    justifyContent: "space-evenly",
    textAlign: "center",
  },
  image: {
    width: "45%",
    height: 200,
    borderColor: "blue",
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: "auto",
  },
  imageContainer: {
    width: "100%",
    height: "auto",
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    marginBottom: 10,
  },
  imageBackground: {
    width: "auto",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  conditions: {
    width: "50%",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  condition: {
    fontWeight: "bold",
    marginLeft: 10,
  },
  titleStyle: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 2,
  },
  descStyle: {
    fontSize: 12,
    color: "#333",
    marginVertical: 2,
  },
});
