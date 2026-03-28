// screens/NotificationsScreen.js
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState, useContext } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import NotificationItem from "./NotificationItem";
import { db } from "../../../firebase";
import { AuthContext } from "../../services/context";
import BackwardIcon from "../../assets/icons/backward.svg";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Notification({ navigation }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    });

    return unsubscribe;
  }, [user?.uid]);

  // 읽음 처리
  const markAsRead = async (item) => {
    try {
      const ref = doc(db, "users", user.uid, "notifications", item.id);
      await updateDoc(ref, { isRead: true });
    } catch (e) {
      console.error("읽음 처리 실패:", e);
    }
  };

  // 빈 상태
  if (notifications.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <View style={styles.backContainer}>
          <TouchableOpacity
            style={{
              margin: 8,
            }}
            onPress={() => navigation.goBack()}
          >
            <BackwardIcon width={24} height={24} fill="#000" />
          </TouchableOpacity>
        </View>
        <View
          style={{
            height: "90%",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              textAlign: "center",
            }}
          >
            알림이 없습니다
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.emptyContainer}>
      <View style={styles.backContainer}>
        <TouchableOpacity
          style={{
            margin: 8,
          }}
          onPress={() => navigation.goBack()}
        >
          <BackwardIcon width={24} height={24} fill="#000" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => (
          <NotificationItem item={item} onPress={() => markAsRead(item)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    flexDirection: "horizontal",
    width: "100%",
    height: "100%",
  },
  backContainer: {
    width: "100%",
    flexDirection: "horizontal",
    paddingBottom: 0,
    backgroundColor: "#608D00",
  },
});
