import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { useState, useEffect } from "react";
import { parseString } from "react-native-xml2js";

const SERVER_URL = "http://openapi.seoul.go.kr:8088";
const API_KEY = "6b44656447746c733835476551776c";

// 회화, 사진, 영상, 조각, 설치, 입체, 아카이브, 회화, 판화,
// 디지털 드로잉, 평면, 입체, 설치, 영상, 미디어아트, 설치
//사진, 회화, 판화, 영상, 퍼포먼스

const ARTWORK_PARTS = [
  "공예",
  "뉴미디어",
  "도자기",
  "드로잉",
  "디지털 드로잉",
  "미디어",
  "미디어아트",
  "무빙 이미지",
  "벽화",
  "비디오",
  "사운드",
  "사진",
  "상영",
  "설치",
  "아카이브",
  "액티베이션",
  "AI",
  "영상",
  "워크숍",
  "입체",
  "조각",
  "책",
  "출판",
  "커미션",
  "토크",
  "판화",
  "퍼포먼스",
  "평면",
  "한국화",
  "회화",
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
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <View style={styles.handle} />
          <Text
            style={{
              fontWeight: "bold",
              marginVertical: 8,
              textAlign: "center",
              fontSize: 18,
            }}
          >
            필터
          </Text>

          <Text
            style={{ marginVertical: 12, paddingLeft: 10, fontWeight: "bold" }}
          >
            장르
          </Text>
          <View
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
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

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 30,
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelBtn}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                fetchAndApply();
                onClose();
              }}
            >
              <Text style={styles.selectBtn}>선택완료</Text>
            </TouchableOpacity>
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
    justifyContent: "flex-end",
  },
  backdropTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    minHeight: 550,
    maxHeight: "80%",
    overflow: "scroll",
    flexDirection: "column",
  },
  partButton: {
    width: "auto",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "black",
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  partButtonActive: {
    backgroundColor: "#608D00",
    borderColor: "#608D00",
  },
  partText: { color: "#333" },
  partTextActive: { color: "#fff" },
  filterContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    // borderColor: "red",
    // borderWidth: 1,
    alignItems: "center",
    paddingHorizontal: 4,
    horizontal: true,
  },
  cancelBtn: {
    marginRight: 12,
    color: "#608D00",
    borderWidth: 2,
    borderRadius: 20,
    borderColor: "#608D00",
    textAlign: "center",
    lineHeight: 32,
    height: 35,
    width: 90,
    fontWeight: "bold",
  },
  selectBtn: {
    marginRight: 12,
    backgroundColor: "#608D00",
    color: "#fff",
    textAlign: "center",
    lineHeight: 32,
    borderRadius: 20,
    height: 35,
    width: 90,
    fontWeight: "bold",
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
