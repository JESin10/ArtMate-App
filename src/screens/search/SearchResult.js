import { useFocusEffect, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackwardIcon from "../../assets/icons/backward.svg";
import Mainlogo from "../../assets/icons/logo-main.svg";
import ArtworkInfoModal from "../../components/modals/ArtworkInfoModal";
import PlacesInfoModal from "../../components/modals/PlacesInfoModal";
import SearchBar from "../../components/search/SearchBar";
import useSearch from "../../hooks/useSearch";
import { colors } from "../../styles/colors";
import { fontSize, radius, spacing } from "../../styles/theme";

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
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListHeaderComponent={
          <View style={{ padding: spacing.sm }}>
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => navigation.navigate("Bottom", { screen: "Home" })}
            >
              <Mainlogo width={150} height={50} />
            </TouchableOpacity>

            <SearchBar />

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <BackwardIcon width={36} height={36} fill={colors.black} />
              </TouchableOpacity>

              <Text style={styles.resultTitle}>
                <Text style={styles.keyword}>[{keyword}]</Text> 의 검색결과
              </Text>
            </View>
          </View>
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
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: fontSize.sm,
                  }}
                >
                  {item.type}
                </Text>
              </View>
              <View style={styles.resultName}>
                <Text>{item.name}</Text>
              </View>
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
          <View style={{ padding: spacing.xl }}>
            <Text
              style={{
                fontSize: fontSize.lg,
                fontWeight: "bold",
                marginBottom: spacing.md,
              }}
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
                  <Text style={{ color: colors.primary }}>{word}</Text>
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
    fontSize: fontSize.md,
    width: "90%",
    margin: "auto",
  },
  keyword: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
  },
  resultContainer: {
    width: "95%",
    padding: spacing.sm,
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
    marginRight: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    textAlign: "center",
    margin: "auto",
    padding: spacing.xs,
    alignItems: "center",
  },
  resultName: {
    width: "75%",
    justifyContent: "center",
    textAlign: "center",
    paddingVertical: spacing.xs,
  },
  popularKeywordContainer: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: "transparent",
    margin: spacing.xs,
    textAlign: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
