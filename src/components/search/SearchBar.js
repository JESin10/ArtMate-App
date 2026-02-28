import { View, TextInput, StyleSheet, Keyboard } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";

export default function SearchBar() {
  const navigation = useNavigation();
  const [keyword, setKeyword] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      // 화면 다시 포커스될 때 초기화
      setKeyword("");
    }, []),
  );

  const handleSubmit = () => {
    if (!keyword.trim()) return;
    Keyboard.dismiss(); // 🔥 추가

    navigation.navigate("SearchResult", { keyword });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="검색어 입력"
        value={keyword}
        onChangeText={setKeyword}
        onSubmitEditing={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    justifyContent: "center",
    width: "95%",
    margin: "auto",
    marginVertical: 14,
  },
});
