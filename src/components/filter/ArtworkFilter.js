import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useArtStore } from "../../store/useArtStore";
import { colors } from "../../styles/colors";

export default function ArtworkFilter({
  visible,
  onClose,
  onApply,
  initStart,
  initEnd,
  genres,
  regions,
}) {
  const { filter, setFilter, resetFilter } = useArtStore();

  const {
    start,
    end,
    genres: selectedGenres,
    regions: selectedRegions,
    minRating: selectedRating,
  } = filter;

  const [sIdx, setSIdx] = useState(String(initStart ?? "1"));
  const [eIdx, setEIdx] = useState(String(initEnd ?? "60"));
  const [openGenre, setOpenGenre] = useState(true);
  const [openRegion, setOpenRegion] = useState(false);
  const [openRating, setOpenRating] = useState(false);

  useEffect(() => {
    if (initStart !== undefined) setSIdx(String(initStart));
    if (initEnd !== undefined) setEIdx(String(initEnd));
  }, [initStart, initEnd]);

  const toggleGenre = (genre) => {
    const next = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];

    setFilter({ genres: next });
  };

  const toggleRegion = (region) => {
    const next = selectedRegions.includes(region)
      ? selectedRegions.filter((r) => r !== region)
      : [...selectedRegions, region];

    setFilter({ regions: next });
  };

  const handleApply = () => {
    onApply(filter);
    onClose();
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
                  onPress={() => setFilter({ genres: [] })}
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
                  onPress={() => setFilter({ regions: [] })}
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
            {/* 평점 필터 */}
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setOpenRating((prev) => !prev)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.sectionTitle}>평점</Text>
                <Text style={styles.sectionTitle}>
                  {openRating ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
              {openRating && (
                <View style={styles.filterContainer}>
                  {[0, 1, 2, 3, 4, 5].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.partButton,
                        selectedRating === r && styles.partButtonActive,
                      ]}
                      onPress={() => setFilter({ minRating: r })}
                    >
                      <Text
                        style={
                          selectedRating === r
                            ? styles.partTextActive
                            : styles.partText
                        }
                      >
                        {r === 0 ? "전체" : `${r}점 이상`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
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
    borderBottomColor: colors.primary,
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
    borderColor: colors.primary,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  partButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  partText: { color: colors.text },
  partTextActive: { color: colors.white },
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
    borderTopColor: colors.primary,
  },
  cancelBtn: {
    marginRight: 12,
    color: colors.primary,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: colors.primary,
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
    backgroundColor: colors.primary,
    borderRadius: 20,
    borderColor: colors.primary,
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
