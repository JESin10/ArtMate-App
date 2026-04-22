import { StyleSheet, Text, View } from "react-native";

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
    paddingVertical: 10,
    paddingLeft: 10,
  },
  title: {
    fontSize: 22,
    color: "black",
    fontWeight: "bold",
    alignItems: "flex-start",
    paddingLeft: 10,
    paddingVertical: 10,
  },
  right: {
    flexDirection: "row",
  },
});
