import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import React from "react";

export default function ArtworkInfoModal({
  visible,
  onClose,
  artwork,
  detail,
}) {
  // console.log("ArtworkInfoArtwork:", artwork);
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
            <View style={styles.textContainer}>
              <Text style={styles.titleText1}>{artwork?.DP_NAME}</Text>
            </View>
            <View style={styles.image}>
              {artwork?.DP_MAIN_IMG && artwork.DP_MAIN_IMG ? (
                <ImageBackground
                  source={{ uri: artwork.DP_MAIN_IMG }}
                  style={styles.imageBackground}
                  imageStyle={styles.tumbnail}
                  resizeMode="cover"
                />
              ) : (
                <Text>No Image</Text>
              )}
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
              <Text style={styles.subText}>{artwork?.DP_LNK}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>상세설명</Text>
              {artwork?.DP_INFO ? (
                <Text style={styles.subText}> {artwork?.DP_INFO} </Text>
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
    border: "solid",
    borderColor: "red",
    borderWidth: 1,
    padding: 10,
  },
  titleText2: {
    width: "20%",
    fontWeight: "bold",
    fontsize: 14,
    marginRight: 10,
  },
  subText: {
    fontWeight: "normal",
    fontsize: 14,
    flexShrink: 1,
    color: "gray",
  },
  textContainer: {
    marginBottom: 10,
    width: "100%",
    flexDirection: "row",
    // justifyContent: "space-between",
    border: "solid",
    borderColor: "green",
    borderWidth: 1,
    padding: 10,
  },
  image: {
    width: "100%",
    height: 300,
    borderColor: "blue",
    borderWidth: 1,
    borderRadius: 10,
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
  tumbnail: { borderRadius: 10 },
});
