import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";

export default function ArtworkFilter({
  visible,
  onClose,
  onApply,
  initStart,
  initEnd,
  genres,
  regions,
  realm,
}) {
  const [sIdx, setSIdx] = useState(String(initStart ?? "1"));
  const [eIdx, setEIdx] = useState(String(initEnd ?? "60"));
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedRealm, setSelectedRealm] = useState([]);
  const [openGenre, setOpenGenre] = useState(true);
  const [openRegion, setOpenRegion] = useState(false);
  const [openRealm, setOpenRealm] = useState(false);

  useEffect(() => {
    if (initStart !== undefined) setSIdx(String(initStart));
    if (initEnd !== undefined) setEIdx(String(initEnd));
  }, [initStart, initEnd]);

  useEffect(() => {
    if (visible) {
      setSelectedGenres([]);
      setSelectedRegions([]);
      setSelectedRealm([]);
    }
  }, [visible]);

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const toggleRegion = (region) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region],
    );
  };

  const toggleRealm = (realm) => {
    setSelectedRealm((prev) =>
      prev.includes(realm) ? prev.filter((r) => r !== realm) : [...prev, realm],
    );
  };

  const handleApply = () => {
    const start = Math.max(1, parseInt(sIdx || "1", 10));
    const end = Math.max(start, parseInt(eIdx || String(start + 59), 10));
    onApply({
      start,
      end,
      genres: selectedGenres,
      regions: selectedRegions,
      realm: selectedRealm,
    });
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
          <Text style={styles.title}>필터</Text>
          <ScrollView
            style={{
              maxHeight: 320,
            }}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              onPress={() => setOpenGenre((prev) => !prev)}
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.sectionTitle}>장르</Text>
              <Text style={styles.sectionTitle}>{openGenre ? "▲" : "▼"}</Text>
            </TouchableOpacity>
            {openGenre && (
              <View style={styles.filterContainer}>
                <TouchableOpacity
                  style={[
                    styles.partButton,
                    selectedGenres.length === 0 && styles.partButtonActive,
                  ]}
                  onPress={() => setSelectedGenres([])}
                >
                  <Text
                    style={
                      selectedGenres.length === 0
                        ? styles.partTextActive
                        : styles.partText
                    }
                  >
                    전체
                  </Text>
                </TouchableOpacity>

                {genres.map((part, index) => {
                  const active = selectedGenres.includes(part);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.partButton,
                        active && styles.partButtonActive,
                      ]}
                      onPress={() => toggleGenre(part)}
                    >
                      <Text
                        style={active ? styles.partTextActive : styles.partText}
                      >
                        {part}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            <View style={styles.line} />
            <TouchableOpacity
              onPress={() => setOpenRegion((prev) => !prev)}
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.sectionTitle}>지역</Text>
              <Text style={styles.sectionTitle}>{openRegion ? "▲" : "▼"}</Text>
            </TouchableOpacity>
            {openRegion && (
              <View style={styles.filterContainer}>
                <TouchableOpacity
                  style={[
                    styles.partButton,
                    selectedRegions.length === 0 && styles.partButtonActive,
                  ]}
                  onPress={() => setSelectedRegions([])}
                >
                  <Text
                    style={
                      selectedRegions.length === 0
                        ? styles.partTextActive
                        : styles.partText
                    }
                  >
                    전체
                  </Text>
                </TouchableOpacity>
                {regions.map((part, index) => {
                  const active = selectedRegions.includes(part);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.partButton,
                        active && styles.partButtonActive,
                      ]}
                      onPress={() => toggleRegion(part)}
                    >
                      <Text
                        style={active ? styles.partTextActive : styles.partText}
                      >
                        {part}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            <View style={styles.line} />
            <TouchableOpacity
              onPress={() => setOpenGenre((prev) => !prev)}
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.sectionTitle}>종류</Text>
              <Text style={styles.sectionTitle}>{openRealm ? "▲" : "▼"}</Text>
            </TouchableOpacity>
            {openRealm && (
              <View style={styles.filterContainer}>
                <TouchableOpacity
                  style={[
                    styles.partButton,
                    selectedRealm.length === 0 && styles.partButtonActive,
                  ]}
                  onPress={() => setSelectedRealm([])}
                >
                  <Text
                    style={
                      selectedRealm.length === 0
                        ? styles.partTextActive
                        : styles.partText
                    }
                  >
                    전체
                  </Text>
                </TouchableOpacity>
                {realm.map((part, index) => {
                  const active = selectedRealm.includes(part);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.partButton,
                        active && styles.partButtonActive,
                      ]}
                      onPress={() => toggleRealm(part)}
                    >
                      <Text
                        style={active ? styles.partTextActive : styles.partText}
                      >
                        {part}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleApply();
                onClose();
              }}
              style={styles.selectBtn}
            >
              <Text style={{ color: "white" }}>선택완료</Text>
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
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 30,
    minHeight: 550,
    maxHeight: 550,
    overflow: "scroll",
    flexDirection: "column",
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    width: "100%",
    paddingVertical: 30,
    textAlign: "center",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    // width: "100%",
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 10,
    color: "black",
  },
  line: {
    borderBottomColor: "#608D00",
    borderWidth: 0.5,
    borderColor: "transparent",
    padding: 10,
  },
  partButton: {
    width: "auto",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#608D00",
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
    height: "auto",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingHorizontal: 4,
    horizontal: true,
    overflow: "scroll",
    paddingVertical: 10,
  },
  buttonRow: {
    width: "100%",
    height: "auto",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 20,
    borderColor: "transparent",
    borderTopColor: "#608D00",
  },
  cancelBtn: {
    marginRight: 12,
    color: "#608D00",
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#608D00",
    textAlign: "center",
    lineHeight: 32,
    height: 35,
    width: 90,
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  selectBtn: {
    marginRight: 12,
    backgroundColor: "#608D00",
    borderRadius: 20,
    borderColor: "#608D00",
    borderWidth: 1,
    textAlign: "center",
    lineHeight: 32,
    height: 35,
    width: 90,
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "center",
  },
});
