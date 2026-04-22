import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function RecentArtworkCard({ artwork, onPress, variant }) {
  const sizeStyle =
    variant === "S" ? styles.recentImagesS : styles.recentImagesL;

  if (!artwork) {
    return <View style={[sizeStyle, styles.recentPlaceholder]} />;
  }
  return (
    <TouchableOpacity style={sizeStyle} onPress={onPress}>
      <ImageBackground
        source={{ uri: artwork.thumbnail }}
        style={styles.imageBackground}
        imageStyle={styles.backgroundImage}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  backgroundImage: {
    borderRadius: 10,
  },
  recentImagesS: {
    width: "50%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "white",
    margin: 5,
  },
  recentImagesL: {
    width: "40%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderRadius: 10,
    backgroundColor: "white",
  },
  recentPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 10,
    borderColor: "transparent",
    borderWidth: 1,
  },
});
