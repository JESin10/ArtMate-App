import React from "react";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../styles/colors";
import { fontSize, radius, spacing } from "../../styles/theme";

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
    marginBottom: spacing.sm,
  },

  image: {
    width: "45%",
    height: 160,
    borderRadius: radius.sm,
    marginVertical: spacing.sm,
  },

  imageBackground: {
    width: "100%",
    height: "100%",
  },

  thumbnail: {
    borderRadius: radius.sm,
  },

  discriptions: {
    width: 160,
    height: 160,
    flexDirection: "column",
    marginVertical: spacing.sm,
    marginHorizontal: "auto",
    justifyContent: "center",
    textAlign: "center",
  },
  distanceText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: spacing.xs,
    textAlign: "right",
  },
  titleStyle: {
    fontSize: fontSize.md,
    fontWeight: "bold",
    marginVertical: spacing.md,
  },

  descStyle: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    marginVertical: spacing.md,
  },
});
