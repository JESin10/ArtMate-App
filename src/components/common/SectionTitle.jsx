import { StyleSheet, Text, View } from "react-native";
import { fontSize, spacing } from "../../styles/theme";

export default function SectionTitle({ title, rightComponent }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {rightComponent && <View style={styles.right}>{rightComponent}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    width: "100%",
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    color: "black",
    fontWeight: "bold",
    alignItems: "flex-start",
    paddingLeft: spacing.sm,
    paddingVertical: spacing.sm,
  },
  right: {
    flexDirection: "row",
  },
});
