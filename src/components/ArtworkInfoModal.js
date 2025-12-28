import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Linking,
  Alert,
} from "react-native";
import React from "react";
import InfoIcon from "../assets/icons/info.svg";
import { decode } from "html-entities"; // 추가: HTML 엔티티 디코드

export default function ArtworkInfoModal({
  visible,
  onClose,
  artwork,
  detail,
}) {
  const htmlToPlain = (html) => {
    if (!html) return "";
    const plain = String(html)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<p[^>]*>/gi, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/<\/?[^>]+(>|$)/g, "") // 남은 모든 태그 제거
      .trim();
    return decode(plain);
  };

  const openLink = async (rawUrl) => {
    if (!rawUrl) {
      Alert.alert("알림", "유효한 링크가 없습니다.");
      return;
    }
    let url = String(rawUrl).trim();

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("오류", "이 링크를 열 수 없습니다.");
      }
    } catch (err) {
      console.error("openLink error", err);
      Alert.alert("오류", "링크를 열 수 없습니다.");
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
        <View style={styles.ModalContainer}>
          <ScrollView
            contentContainerStyle={styles.ModalContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.image}>
              {artwork?.DP_MAIN_IMG && artwork.DP_MAIN_IMG ? (
                <ImageBackground
                  source={{ uri: artwork.DP_MAIN_IMG }}
                  style={styles.imageBackground}
                  resizeMode="cover"
                />
              ) : (
                <Text>No Image</Text>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText1}>{artwork?.DP_NAME}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>작가</Text>
              <Text style={styles.subText}>{artwork?.DP_ARTIST}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>장르</Text>
              {artwork?.DP_ART_PART && artwork.DP_ART_PART ? (
                <Text style={styles.subText}> {artwork?.DP_ART_PART} </Text>
              ) : (
                <Text style={styles.subText}> 정보없음</Text>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>주소</Text>
              <Text style={styles.subText}>{artwork?.DP_PLACE}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>전시기간</Text>
              <Text style={styles.subText}>
                {artwork?.DP_START} ~ {artwork?.DP_END}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>운영시간</Text>

              {artwork?.DP_VIEWTIME && artwork.DP_VIEWTIME ? (
                <Text style={styles.subText}> {artwork?.DP_VIEWTIME} </Text>
              ) : (
                <Text style={styles.subText}> 정보없음</Text>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>홈페이지</Text>
              {artwork?.DP_LNK ? (
                <TouchableOpacity
                  style={styles.linkIcon}
                  onPress={() =>
                    Alert.alert(
                      "홈페이지로 이동",
                      "홈페이지로 이동하시겠습니까?",
                      [
                        { text: "취소", style: "cancel" },
                        {
                          text: "이동",
                          onPress: () => openLink(artwork.DP_LNK),
                        },
                      ],
                      { cancelable: true }
                    )
                  }
                >
                  <InfoIcon
                    width={20}
                    height={20}
                    fill="#000"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.subText}>홈페이지로 이동</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.subText}> 정보없음</Text>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>상세설명</Text>
              {artwork?.DP_INFO ? (
                <Text style={styles.subText}>
                  {htmlToPlain(artwork?.DP_INFO)}
                </Text>
              ) : (
                <Text style={styles.subText}> 정보없음</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdropTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ModalContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    minHeight: 300,
    maxHeight: "80%",
    // height: "80%",
    overflow: "scroll",
    flex: 1,
    flexDirection: "column",
  },
  ModalContent: { paddingBottom: 20 },
  titleText1: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 20,
    borderColor: "white",
    borderBottomColor: "#C6C6C6",
    borderWidth: 1,
    width: "100%",
    padding: 10,
  },
  titleText2: {
    width: "20%",
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 10,
    paddingTop: 2,
  },
  subText: {
    fontWeight: "normal",
    fontSize: 12,
    flexShrink: 1,
    color: "gray",
  },

  linkIcon: {
    marginBottom: 2,
    flexDirection: "row",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginBottom: 10,
    width: "100%",
    flexDirection: "row",
    padding: 10,
  },
  image: {
    width: "100%",
    height: 300,
    marginVertical: 10,
    alignSelf: "center",
    overflow: "hidden",
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
