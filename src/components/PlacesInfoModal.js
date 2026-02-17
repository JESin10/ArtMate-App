import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import InfoIcon from "../assets/icons/info.svg";
import React, { useEffect, useState } from "react";
import { use } from "react";
import { decode } from "html-entities";
import Map from "../screens/Map";

export default function PlacesInfoModal({ visible, onClose, item, detail }) {
  const [city, setCity] = useState("");
  //   console.log("PlacesInfoItem:", item);
  // console.log("PlacesInfoDetail:", detail);

  const getProvinceFromAddress = (addr) => {
    if (!addr) return "";
    const first = String(addr).trim().split(/\s+/)[0];

    // Normalize common forms
    if (/서울/.test(first)) return "서울시";
    if (/경기/.test(first)) return "경기도";
    if (/^(부산|대구|광주|대전|울산|인천|세종)/.test(first)) {
      // convert '부산광역시' -> '부산시', '서울특별시' handled above
      return first.replace(/(광역시|특별시)$/, "시");
    }
    if (/도$/.test(first)) return first; // e.g., '강원도', '전라북도'
    if (/시$/.test(first)) return first; // e.g., '수원시'

    return first;
  };

  useEffect(() => {
    if (detail?.culAddr) {
      const province = getProvinceFromAddress(detail.culAddr);
      // console.log("province:", province);
      setCity(province);
    }
  }, [detail?.culAddr]);

  const openLink = async (rawUrl) => {
    if (!rawUrl) {
      Alert.alert("알림", "유효한 링크가 없습니다.");
      return;
    }
    let url = String(rawUrl).replace("http", "https");
    // if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    console.log("url:", url);

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
              {detail?.culViewImg1 ? (
                <ImageBackground
                  source={{ uri: detail.culViewImg1.replace("http", "https") }}
                  style={styles.imageBackground}
                  resizeMode="contain"
                />
              ) : (
                <Text>No Image</Text>
              )}
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText1}>
                {detail?.culName} / {city}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>주소</Text>
              <Text style={styles.subText}>{detail?.culAddr}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>우편번호</Text>
              <Text style={styles.subText}>{detail?.zipCode}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>전화번호</Text>
              <Text style={styles.subText}>{detail?.culTel}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>홈페이지</Text>
              {detail?.culHomeUrl ? (
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
                          onPress: () => openLink(detail.culHomeUrl),
                        },
                      ],
                      { cancelable: true },
                    )
                  }
                >
                  <InfoIcon width={20} height={20} style={{ marginRight: 8 }} />
                  <Text style={styles.subText}>홈페이지로 이동</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.subText}> 정보없음</Text>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>상세설명</Text>
              {detail?.culCont ? (
                <Text style={styles.subText}>
                  {htmlToPlain(detail?.culCont)}
                </Text>
              ) : (
                <Text style={styles.subText}> 정보없음</Text>
              )}
            </View>
            <View style={styles.mapContainer}>
              <Text style={styles.titleText2}>지도</Text>
              <Map x={detail?.gpsY} y={detail?.gpsX} />
              {/* <Text style={styles.subText}>{detail?.gpsX}</Text>
              <Text style={styles.subText}>{detail?.gpsY}</Text> */}
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
    paddingVertical: 20,
    paddingHorizontal: 10,
  },

  titleContainer: {
    width: "100%",
    borderColor: "transparent",
    borderBottomColor: "#C6C6C6",
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  titleText2: {
    width: "20%",
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 10,
    marginTop: 2,
  },
  subText: {
    fontWeight: "normal",
    fontSize: 12,
    flexShrink: 1,
    color: "gray",
  },
  textContainer: {
    marginBottom: 10,
    width: "100%",
    flexDirection: "row",
    border: "solid",
    padding: 10,
  },
  mapContainer: {
    height: 400,
    marginBottom: 10,
    width: "100%",
    flexDirection: "row",
    border: "solid",
    padding: 10,
  },
  image: {
    width: "100%",
    height: 250,
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
  linkIcon: {
    flexDirection: "row",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
});
