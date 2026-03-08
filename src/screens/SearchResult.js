import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  StyleSheet,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import useSearch from "../../src/components/hooks/useSearch";
import BackwardIcon from "../assets/icons/backward.svg";
import SearchBar from "../components/search/SearchBar";
import Mainlogo from "../assets/icons/logo-main.svg";
import React, { useState } from "react";
import PlacesInfoModal from "../components/modals/PlacesInfoModal";
import ArtworkInfoModal from "../components/modals/ArtworkInfoModal";

export default function SearchResult({ navigation }) {
  const route = useRoute();
  const { keyword } = route.params;
  const { results, loading } = useSearch(keyword);
  const [selectedItem, setSelectedItem] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const popularKeywords = [
    "서울",
    "식물",
    "상설전",
    "국립현대미술관",
    "서울시립미술관",
  ];

  useFocusEffect(
    React.useCallback(() => {
      Keyboard.dismiss();
    }, []),
  );

  if (loading)
    return (
      <ActivityIndicator
        style={{ marginTop: 30, backgroundColor: "#000, 0.3" }}
      />
    );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        width: "95%",
        height: "100%",
        marginHorizontal: "auto",
        flexDirection: "column",
      }}
    >
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            <View style={{ padding: 10 }}>
              <TouchableOpacity
                style={{ alignItems: "center" }}
                onPress={() =>
                  navigation.navigate("Bottom", { screen: "Home" })
                }
              >
                <Mainlogo width={150} height={50} />
              </TouchableOpacity>

              <SearchBar />

              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <BackwardIcon width={36} height={36} fill="black" />
                </TouchableOpacity>

                <Text style={styles.resultTitle}>
                  <Text style={styles.keyword}>[{keyword}]</Text> 의 검색결과
                </Text>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedItem(item);
              setModalVisible(true);
            }}
            style={styles.resultContainer}
          >
            <View style={styles.results}>
              <View style={styles.resultType}>
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 14 }}
                >
                  {item.type}
                </Text>
              </View>
              <View style={styles.resultName}>
                <Text>{item.name}</Text>
              </View>
              {/* <Text style={styles.resultName}>{item.name}</Text> */}
            </View>
          </TouchableOpacity>
        )}
        //FlatList의 빈 데이터 전용 props
        ListEmptyComponent={
          keyword ? (
            <View
              style={{
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                }}
              >
                검색 결과가 없습니다
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          <View style={{ padding: 20 }}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}
            >
              🔥 금주의 인기 검색어
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                height: "100%",
              }}
            >
              {popularKeywords.map((word, index) => (
                <TouchableOpacity
                  key={`${word}-${index}`}
                  style={styles.popularKeywordContainer}
                  onPress={() =>
                    navigation.push("SearchResult", { keyword: word })
                  }
                >
                  <Text style={{ color: "#608D00" }}>{word}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
      />

      {/* Place 모달 */}
      {selectedItem?.type === "place" && (
        <PlacesInfoModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedItem(null);
          }}
          seq={selectedItem.id}
        />
      )}

      {/* Artwork 모달 */}
      {selectedItem?.type === "artwork" && (
        <ArtworkInfoModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedItem(null);
          }}
          seq={selectedItem.id}
          artwork={selectedItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  resultTitle: {
    fontSize: 16,
    width: "90%",
    margin: "auto",
  },
  keyword: {
    fontSize: 20,
    fontWeight: "bold",
  },
  resultContainer: {
    width: "95%",
    padding: 10,
    justifyContent: "center",
    margin: "auto",
  },
  results: {
    width: "100%",
    flexDirection: "row",
    padding: 4,
  },
  resultType: {
    width: "22%",
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#608D00",
    backgroundColor: "#608D00",
    textAlign: "center",
    margin: "auto",
    padding: 4,
    alignItems: "center",
  },
  resultName: {
    width: "75%",
    justifyContent: "center",
    textAlign: "center",
    paddingVertical: 8,
  },
  popularKeywordContainer: {
    borderWidth: 1,
    borderColor: "#608D00",
    borderRadius: 20,
    backgroundColor: "transparent",
    margin: 8,
    textAlign: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
});
