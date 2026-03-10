import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackwardIcon from "../assets/icons/backward.svg";
import { AuthContext } from "../services/context";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import ArtworkInfoModal from "../components/modals/ArtworkInfoModal";
import PlacesInfoModal from "../components/modals/PlacesInfoModal";

export default function Bookmarks({ navigation }) {
  const { user } = useContext(AuthContext);
  const [myBookmarks, setMyBookmarks] = useState([]);
  const [showArtworkModal, setShowArtworkModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [myPins, setMyPins] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPlaceModal, setShowPlaceModal] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    // Firestore 컬렉션 실시간 구독
    const pinsRef = collection(db, "users", user.uid, "pins");
    const b = query(pinsRef, orderBy("createdAt", "desc")); // 최신순 정렬

    const unsubscribe = onSnapshot(
      b,
      (snapshot) => {
        const pinData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMyPins(pinData);
      },
      (error) => {
        console.error("실시간 구독 에러:", error);
      },
    );

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, [user?.uid]);

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

  // console.log(selectedArtwork);

  const handleArtworkModalOpen = (item) => {
    setSelectedArtwork(item);
    setShowArtworkModal(true);
  };

  const handlePlaceModalOpen = (item) => {
    setSelectedPlace(item);
    setShowPlaceModal(true);
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
          <Text> 작품</Text>
        </View>
        <View>
          {myBookmarks.map((item) => (
            <TouchableOpacity
              key={item.seq}
              onPress={() => handleArtworkModalOpen(item)}
            >
              <Text>{item.artworkTitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View>
          <Text> 장소</Text>
        </View>
        <View>
          {myPins.map((item) => (
            <TouchableOpacity
              key={item.seq}
              onPress={() => handlePlaceModalOpen(item)}
            >
              <Text>{item.placeName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ArtworkInfoModal
        visible={showArtworkModal}
        onClose={() => {
          setShowArtworkModal(false);
          setSelectedArtwork(null);
        }}
        artwork={selectedArtwork}
        seq={selectedArtwork?.seq}
      />

      <PlacesInfoModal
        visible={showPlaceModal}
        onClose={() => {
          setShowPlaceModal(false);
          setSelectedPlace(null);
        }}
        seq={selectedPlace?.seq}
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
