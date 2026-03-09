import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackwardIcon from "../assets/icons/backward.svg";
import { AuthContext } from "../services/context";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import ArtworkInfoModal from "../components/modals/ArtworkInfoModal";

export default function Bookmarks({ navigation }) {
  const { user } = useContext(AuthContext);
  const [myBookmarks, setMyBookmarks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    // Firestore 컬렉션 실시간 구독
    const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
    const q = query(bookmarksRef, orderBy("createdAt", "desc")); // 최신순 정렬

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookmarkData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMyBookmarks(bookmarkData);
      },
      (error) => {
        console.error("실시간 구독 에러:", error);
      },
    );

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, [user?.uid]);

  console.log(selectedArtwork);

  const handleModalOpen = (item) => {
    setSelectedArtwork(item);
    setShowModal(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.settingFactorContainer}>
        <View style={styles.userSetting}>
          <TouchableOpacity
            style={{ margin: 8 }}
            onPress={() => navigation.goBack()}
          >
            <BackwardIcon width={24} height={24} fill="#fff" />
          </TouchableOpacity>
        </View>
        <View>
          {myBookmarks.map((item) => (
            <TouchableOpacity
              key={item.seq}
              onPress={() => handleModalOpen(item)}
            >
              <Text>{item.artworkTitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ArtworkInfoModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedArtwork(null);
        }}
        artwork={selectedArtwork}
        seq={selectedArtwork?.seq}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  settingFactorContainer: {
    width: "100%",
    height: "100%",
    borderWidth: 3,
    borderColor: "blue",
    backgroundColor: "#b5b5b5",
  },
});
