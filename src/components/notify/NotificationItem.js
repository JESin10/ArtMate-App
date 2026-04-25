// components/NotificationItem.js
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../styles/colors";
import { fontSize, spacing } from "../../styles/theme";

dayjs.extend(relativeTime);

export default function NotificationItem({ item, onPress }) {
  const timeAgo = item.createdAt
    ? dayjs(item.createdAt.toDate()).fromNow()
    : "";

  const getMessage = () => {
    if (item.type === "like") {
      return `${item.fromUserName}님이 회원님의 글을 좋아합니다`;
    }
    if (item.type === "follow") {
      return `${item.fromUserName}님이 회원님을 팔로우했습니다`;
    }
    return "";
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !item.isRead && styles.unread, // 🔴 안읽음 표시
      ]}
      onPress={onPress}
    >
      <View>
        <Text style={styles.message}>{getMessage()}</Text>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  unread: {
    backgroundColor: colors.lightBlue, // 🔥 안읽음 배경
  },
  message: {
    fontSize: fontSize.sm,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
  },
});
