import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React from "react";

export default function PlacesInfo({ visible, onClose, item, detail }) {
  //   console.log("PlacesInfoItem:", item);
  console.log("PlacesInfoDetail:", detail);
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
        <View style={styles.sheet}>
          <View style={styles.image}>
            {detail?.culViewImg1 ? (
              <ImageBackground
                source={{ uri: detail.culViewImg1 }}
                style={styles.imageBackground}
                imageStyle={styles.tumbnail}
                resizeMode="cover"
              />
            ) : (
              <Text>No Image</Text>
            )}
          </View>
          <Text style={styles.sheetTitle}>{detail.curlGrpName}</Text>
          <Text style={styles.sheetTitle}>{detail.culName}</Text>
          <Text style={styles.sheetTitle}>{detail.culAddr}</Text>
          <Text style={styles.sheetTitle}>{detail.zipCode}</Text>

          <Text style={styles.sheetTitle}>{detail.culTel}</Text>
          <Text style={styles.sheetTitle}>{detail.culHomeUrl}</Text>
          <Text style={styles.sheetTitle}>{detail.gpsX}</Text>
          <Text style={styles.sheetTitle}>{detail.gpsY}</Text>
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
  sheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    // minHeight: 300,
    // maxHeight: "80%",
    height: "80%",
    overflow: "scroll",
  },
  sheetTitle: {
    fontWeight: "bold",
    marginBottom: 8,
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
