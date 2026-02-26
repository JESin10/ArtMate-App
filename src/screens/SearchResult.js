import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Keyboard,
  StyleSheet,
  Button,
} from "react-native";
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

  useFocusEffect(
    React.useCallback(() => {
      Keyboard.dismiss();
    }, []),
  );

  console.log(selectedItem);
  if (loading) return <ActivityIndicator style={{ marginTop: 30 }} />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            <View style={{ padding: 10 }}>
              <TouchableOpacity style={{ alignItems: "center" }}>
                <Mainlogo width={150} height={50} />
              </TouchableOpacity>

              <SearchBar />

              <TouchableOpacity
                style={{ margin: 8 }}
                onPress={() => navigation.goBack()}
              >
                <BackwardIcon width={24} height={24} fill="black" />
              </TouchableOpacity>

              <Text style={styles.description}>
                <Text style={styles.keyword}>[{keyword}]</Text> 의 검색결과
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedItem(item);
              setModalVisible(true);
            }}
          >
            <Text style={{ padding: 15 }}>
              [{item.type}] {item.name}
            </Text>
          </TouchableOpacity>
        )}
        //FlatList의 빈 데이터 전용 props
        ListEmptyComponent={
          keyword ? (
            <Text style={{ padding: 20, textAlign: "center" }}>
              검색 결과가 없습니다
            </Text>
          ) : null
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
          artwork={selectedItem.id}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 16,
  },
  keyword: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
