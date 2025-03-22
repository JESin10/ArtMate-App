import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
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

export default function Places() {
  const [gallery, setGallery] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [listCnt, setListCnt] = useState(10);

  // const { apikey, serverurl } = Constants.manifest2.extra;
  // console.log("API Key:", apikey);
  // console.log("Server URL:", serverurl);

  const getPlace = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/artgallery?serviceKey=${API_KEY}&PageNo=${pageNum}&numOfrows=${listCnt}`
      );
      const xmlText = await response.text(); // XML 데이터를 텍스트로 변환

      parseString(xmlText, { explicitArray: false }, (err, jsonData) => {
        if (err) {
          console.error("XML 파싱 오류:", err);
          return;
        }
        setGallery(jsonData.response.body.items.item);
      });
    } catch (error) {
      console.error("데이터 불러오기 오류:", error);
    }
  };

  useEffect(() => {
    getPlace();
  }, []);
  console.log("gallery: ", gallery);

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
            {gallery.length > 0 &&
              gallery.map((item, index) => (
                <View key={index} style={styles.imageContainer}>
                  <View style={styles.image}>
                    <Text>Images</Text>
                  </View>
                  <View style={styles.discriptions}>
                    <Text>{item.culName}</Text>
                    <Text>sub description</Text>
                    <Text>{item.culTel}</Text>
                    <Text>distance</Text>
                  </View>
                </View>
              ))}

            {/* <View style={styles.imageContainer}>
              <View style={styles.image}>
                <Text>Images</Text>
              </View>
              <View style={styles.discriptions}>
                <Text>discription</Text>
                <Text>sub discription</Text>
                <Text>hoilday</Text>
                <Text>distant</Text>
              </View>
            </View>
            <View style={styles.imageContainer}>
              <View style={styles.image}>
                <Text>Images</Text>
              </View>
              <View style={styles.discriptions}>
                <Text>discription</Text>
                <Text>sub discription</Text>
                <Text>hoilday</Text>
                <Text>distant</Text>
              </View>
            </View> */}
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
    width: "45%",
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
  conditions: {
    width: "50%",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  condition: {
    fontWeight: "bold",
    marginLeft: 10,
  },
});
