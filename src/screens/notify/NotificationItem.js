// components/NotificationItem.js
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

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
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  unread: {
    backgroundColor: "#eef6ff", // 🔥 안읽음 배경
  },
  message: {
    fontSize: 14,
  },
  time: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
});
