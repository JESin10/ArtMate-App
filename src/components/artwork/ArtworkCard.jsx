import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatDate } from "../../utils/date";

export default function ArtworkCard({ item, openArtwork }) {
  return (
    <TouchableOpacity
      style={styles.recommendCard}
      activeOpacity={0.8}
      onPress={() => {
        openArtwork(item);
      }}
    >
      <ImageBackground
        source={{ uri: item.thumbnail }}
        style={styles.recommendImage}
        imageStyle={styles.MainbackgroundImage}
        resizeMethod="cover"
      />
      <View style={styles.container}>
        <Text numberOfLines={1} style={styles.recommendPart}>
          {item.place}
        </Text>
        <Text numberOfLines={1} style={styles.recommendTitle}>
          {item.title}
        </Text>
        <Text style={styles.DescStyle}>
          {formatDate(item.startDate)} ~{formatDate(item.endDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    backgroundColor: "#608D00",
    padding: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  MainbackgroundImage: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  recommendCard: {
    width: 310,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: "transparent",
    padding: 10,
    overflow: "hidden",
  },
  recommendImage: {
    width: "100%",
    height: 450,
    borderRadius: 8,
  },
  recommendTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#fff",
  },
  recommendPart: {
    fontSize: 12,
    color: "gray",
  },
  DescStyle: {
    fontSize: 10,
    color: "#fff",
    marginVertical: 4,
  },
});
