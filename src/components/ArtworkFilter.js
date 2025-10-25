import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { parseString } from "react-native-xml2js";
const SERVER_URL = "http://openapi.seoul.go.kr:8088";
const API_KEY = "6b44656447746c733835476551776c";

const ARTWORK_PARTS = [
  "벽화",
  "판화",
  "조각",
  "회화",
  "사진",
  "설치",
  "아크릴",
  "실크",
  "드로잉",
  "혼합재료",
  "한국화",
  "서양화",
];

export default function ArtworkFilter({
  visible,
  onClose,
  onApply,
  initStart,
  initEnd,
  parts = [],
}) {
  const [sIdx, setSIdx] = useState(String(initStart ?? "1"));
  const [eIdx, setEIdx] = useState(String(initEnd ?? "60"));
  const [selectedParts, setSelectedParts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initStart !== undefined) setSIdx(String(initStart));
    if (initEnd !== undefined) setEIdx(String(initEnd));
  }, [initStart, initEnd]);

  useEffect(() => {
    if (visible) setSelectedParts([]);
  }, [visible]);

  const togglePart = (dp_artpart) => {
    if (selectedParts.includes(dp_artpart)) {
      setSelectedParts((prev) =>
        prev.filter((inputText) => inputText !== dp_artpart)
      );
    } else {
      setSelectedParts((prev) => [...prev, dp_artpart]);
    }
  };

  const fetchAndApply = async () => {
    const start = Math.max(1, parseInt(sIdx || "1", 10));
    const end = Math.max(start, parseInt(eIdx || String(start + 59), 10));
    setLoading(true);

    try {
      const res = await fetch(
        `${SERVER_URL}/${API_KEY}/xml/ListExhibitionOfSeoulMOAInfo/${start}/${end}/`
      );
      const xmlText = await res.text();

      parseString(xmlText, { explicitArray: false }, (error, jsonData) => {
        setLoading(false);
        if (error) {
          onApply({ items: [], parts: selectedParts, start, end });
          return;
        }
        let items = jsonData.ListExhibitionOfSeoulMOAInfo?.row || [];
        if (!Array.isArray(items)) items = [items];

        if (Array.isArray(selectedParts) && selectedParts.length > 0) {
          const lowered = selectedParts.map((dp_artpart) =>
            String(dp_artpart).toLowerCase()
          );
          items = items.filter((parts) =>
            lowered.some((dp_artpart) =>
              String(parts.DP_ART_PART || "")
                .toLowerCase()
                .includes(dp_artpart)
            )
          );
        }

        onApply({ items, parts: selectedParts, start, end });
      });
    } catch (error) {
      setLoading(false);
      onApply({ items: [], parts: selectedParts, start, end });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>필터</Text>

          <Text style={{ marginBottom: 6 }}>카테고리 (DP_ART_PART)</Text>
          <View
            showsHorizontalScrollIndicator={false}
            style={styles.filterConainer}
          >
            <TouchableOpacity
              style={[
                styles.partButton,
                selectedParts.length === 0 && styles.partButtonActive,
              ]}
              onPress={() => setSelectedParts([])}
            >
              <Text
                style={
                  selectedParts.length === 0
                    ? styles.partTextActive
                    : styles.partText
                }
              >
                전체
              </Text>
            </TouchableOpacity>

            {ARTWORK_PARTS.map((DPartPart, index) => {
              const active = selectedParts.includes(DPartPart);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.partButton, active && styles.partButtonActive]}
                  onPress={() => togglePart(DPartPart)}
                >
                  <Text
                    style={active ? styles.partTextActive : styles.partText}
                  >
                    {DPartPart}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <Button title="취소" color="#666" onPress={onClose} />
            <View style={{ width: 12 }} />
            <Button
              title={loading ? "적용 중..." : "적용"}
              onPress={() => {
                fetchAndApply();
                onClose();
              }}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  partButton: {
    width: "auto",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "blue",
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  partButtonActive: {
    backgroundColor: "#333",
    borderColor: "#333",
  },
  partText: { color: "#333" },
  partTextActive: { color: "#fff" },
  filterConainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    borderColor: "red",
    borderWidth: 1,
    alignItems: "center",
    paddingHorizontal: 4,
    horizontal: true,
  },
});

{
  /* <Text>시작 인덱스</Text>
          <TextInput
            value={sIdx}
            onChangeText={setSIdx}
            keyboardType="number-pad"
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              padding: 8,
              marginBottom: 8,
            }}
          />
          <Text>종료 인덱스</Text>
          <TextInput
            value={eIdx}
            onChangeText={setEIdx}
            keyboardType="number-pad"
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              padding: 8,
              marginBottom: 12,
            }}
          /> */
}
