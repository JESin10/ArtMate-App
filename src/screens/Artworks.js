import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import React from "react";

const AuthKey =
  "iUshbHgoTGazZCC2/6vIBZp/B97CWSUUeLAbmBto9st2Aj33IThDavcN4Cy1W8e/dbjWYG0yBe5qU2lZ/ZlPMg==";

export default function Artworks() {
  const getArtwork = async () => {
    const list = await (
      await fetch(
        `http://apis.data.go.kr/B553457/nopenapi/rest/publicperformancedisplays`
        //https://apis.data.go.kr/B553457/nopenapi/rest/cultureartspaces/artgallery?serviceKey=iUshbHgoTGazZCC2%2F6vIBZp%2FB97CWSUUeLAbmBto9st2Aj33IThDavcN4Cy1W8e%2FdbjWYG0yBe5qU2lZ%2FZlPMg%3D%3D&PageNo=1&numOfrows=10
        // `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
      )
    ).json();
    // const filteredList = list.filter(({ dt_txt }) =>
    //   dt_txt.endsWith("03:00:00")
    // );
    // setDays(filteredList);
    console.log("list: ", list);
  };

  // useEffect(() => {
  //   getArtwork();
  // }, []);

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
              <Text>작품 정보</Text>
            </View>
            <View style={styles.conditions}>
              <Text style={styles.condition}>필터</Text>
              <Text style={styles.condition}>새로고침</Text>
            </View>
          </View>
          <View style={styles.imageContainer}>
            <View style={styles.artworks}>
              <Text>Images</Text>
            </View>
            <View style={styles.artworks}>
              <Text>Images</Text>
            </View>
            <View style={styles.artworks}>
              <Text>Images</Text>
            </View>
            <View style={styles.artworks}>
              <Text>Images</Text>
            </View>
            <View style={styles.artworks}>
              <Text>Images</Text>
            </View>
            <View style={styles.artworks}>
              <Text>Images</Text>
            </View>
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
    height: 200,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: "auto",
  },
  imageContainer: {
    width: "100%",
    height: "auto",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    flexWrap: "wrap",
    flexDirection: "row",
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
});
