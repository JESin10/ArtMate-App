import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../styles/colors";
import { fontSize, radius, spacing } from "../../styles/theme";
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
    backgroundColor: colors.primary,
    padding: spacing.xs,
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
  },
  MainbackgroundImage: {
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
  },
  recommendCard: {
    width: 310,
    marginRight: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: "transparent",
    padding: spacing.sm,
    overflow: "hidden",
  },
  recommendImage: {
    width: "100%",
    height: 450,
    borderRadius: radius.xs,
  },
  recommendTitle: {
    fontSize: fontSize.md,
    fontWeight: "bold",
    marginVertical: spacing.xs,
    color: colors.white,
  },
  recommendPart: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  DescStyle: {
    fontSize: fontSize.sm,
    color: colors.white,
    marginVertical: 4,
  },
});
