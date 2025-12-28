import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { use } from "react";

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
                  source={{ uri: detail.culViewImg1 }}
                  style={styles.imageBackground}
                  // imageStyle={styles.tumbnail}
                  resizeMode="cover"
                />
              ) : (
                <Text>No Image</Text>
              )}
            </View>
            <View>
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
              <Text style={styles.subText}>{detail?.culHomeUrl}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>지도</Text>
              <Text style={styles.subText}>{detail?.gpsX}</Text>
              <Text style={styles.subText}>{detail?.gpsY}</Text>
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
    marginBottom: 24,
    borderColor: "white",
    borderBottomColor: "#C6C6C6",
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  titleText2: {
    width: "20%",
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 10,
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
