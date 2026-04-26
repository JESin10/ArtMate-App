import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../firebase";
import { AuthContext } from "../../store/context";
import { colors } from "../../styles/colors";
import NotificationItem from "./NotificationItem";

const screenHeight = Dimensions.get("window").height;

export default function NotificationModal({ visible, onClose }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const translateY = useRef(new Animated.Value(-screenHeight)).current;

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

  //modal animate
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -screenHeight, // 다시 위로
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // 읽음 처리
  const markAsRead = async (item) => {
    try {
      const ref = doc(db, "users", user.uid, "notifications", item.id);
      await updateDoc(ref, { isRead: true });
    } catch (e) {
      console.error("읽음 처리 실패:", e);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={() => onClose()}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1}>
        <Animated.View
          style={[styles.modalContainer, { transform: [{ translateY }] }]}
        >
          {/* <View style={styles.modalOverlay}> */}
          {/* <View style={styles.modalContainer}> */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.modalTitle}>알림</Text>
            <TouchableOpacity onPress={() => onClose()} style={styles.closeBtn}>
              <Text style={{ color: colors.white }}>X</Text>
            </TouchableOpacity>
          </View>
          {notifications.length === 0 ? (
            <SafeAreaView style={styles.emptyContainer}>
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
          ) : (
            <>
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 10 }}
                renderItem={({ item }) => (
                  <NotificationItem
                    item={item}
                    onPress={() => markAsRead(item)}
                  />
                )}
              />
            </>
          )}

          {/* </View> */}
          {/* </View> */}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
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
    backgroundColor: colors.primary,
  },
  modalContainer: {
    height: "50%",
    width: "60%",
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    left: 140,
    top: 100,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeBtn: {
    width: "40",
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});
