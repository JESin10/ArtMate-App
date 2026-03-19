import React from "react";
import {
  View,
  Text,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const PlaceItem = React.memo(({ item, detail, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.imageContainer}
      onPress={onPress}
    >
      <View style={styles.image}>
        {!detail ? (
          <ActivityIndicator />
        ) : detail?.culViewImg1 ? (
          <ImageBackground
            source={{
              uri: detail.culViewImg1.replace("http", "https"),
            }}
            style={styles.imageBackground}
            imageStyle={styles.thumbnail}
          />
        ) : (
          <Text>No Image</Text>
        )}
      </View>
      {/* <View style={styles.image}>
        {detail?.culViewImg1 ? (
          <ImageBackground
            source={{ uri: detail.culViewImg1 }}
            style={styles.imageBackground}
            imageStyle={styles.thumbnail}
          />
        ) : (
          <View style={styles.noImage}>
            <Text>No Image</Text>
          </View>
        )}
      </View> */}

      <View style={styles.discriptions}>
        <Text style={styles.titleStyle}>{item.culName}</Text>
        {/* <Text style={styles.descStyle}>{item.culTel}</Text> */}
        <Text>{detail?.culGrpName}</Text>
        <Text style={styles.descStyle}>{detail?.culAddr}</Text>

        {item?.distance !== undefined && item?.distance !== Infinity && (
          <Text style={styles.distanceText}>
            {item.distance < 1
              ? `${Math.round(item.distance * 1000)}m`
              : `${item.distance.toFixed(1)}km`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default PlaceItem;

const styles = StyleSheet.create({
  imageContainer: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 10,
  },

  image: {
    width: "45%",
    height: 160,
    borderRadius: 10,
    marginVertical: 10,
  },

  imageBackground: {
    width: "100%",
    height: "100%",
  },

  thumbnail: {
    borderRadius: 10,
  },

  discriptions: {
    width: 160,
    height: 160,
    flexDirection: "column",
    marginVertical: 10,
    marginHorizontal: "auto",
    justifyContent: "center",
    textAlign: "center",
  },
  distanceText: {
    fontSize: 12,
    color: "#6B8E23",
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "right",
  },
  titleStyle: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 10,
  },

  descStyle: {
    fontSize: 12,
    color: "#333",
    marginVertical: 10,
  },
});
