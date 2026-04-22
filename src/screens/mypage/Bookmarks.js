import { useContext, useState } from "react";
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackwardIcon from "../../assets/icons/backward.svg";
import Mainlogo from "../../assets/icons/logo-main.svg";
import ArtworkInfoModal from "../../components/modals/ArtworkInfoModal";
import PlacesInfoModal from "../../components/modals/PlacesInfoModal";
import SearchBar from "../../components/search/SearchBar";
import { AuthContext } from "../../store/context";
import { useUserStore } from "../../store/useUserStore";
import { colors } from "../../styles/colors";

export default function Bookmarks({ navigation }) {
  const { user } = useContext(AuthContext);
  const { myBookmarks, setMyBookmarks, myPins, setMyPins } = useUserStore();
  const [showArtworkModal, setShowArtworkModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [tab, setTab] = useState("artwork");

  // useEffect(() => {
  //   if (!user?.uid) return;

  //   // Firestore 컬렉션 실시간 구독
  //   const pinsRef = collection(db, "users", user.uid, "pins");
  //   const b = query(pinsRef, orderBy("createdAt", "desc")); // 최신순 정렬

  //   const unsubscribe = onSnapshot(
  //     b,
  //     (snapshot) => {
  //       const pinData = snapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));
  //       setMyPins(pinData);
  //     },
  //     (error) => {
  //       console.error("실시간 구독 에러:", error);
  //     },
  //   );

  //   // 컴포넌트 언마운트 시 구독 해제
  //   return () => unsubscribe();
  // }, [user?.uid]);

  // useEffect(() => {
  //   if (!user?.uid) return;

  //   // Firestore 컬렉션 실시간 구독
  //   const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
  //   const q = query(bookmarksRef, orderBy("createdAt", "desc")); // 최신순 정렬

  //   const unsubscribe = onSnapshot(
  //     q,
  //     (snapshot) => {
  //       const bookmarkData = snapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));
  //       setMyBookmarks(bookmarkData);
  //     },
  //     (error) => {
  //       console.error("실시간 구독 에러:", error);
  //     },
  //   );

  //   // 컴포넌트 언마운트 시 구독 해제
  //   return () => unsubscribe();
  // }, [user?.uid]);

  const handleArtworkModalOpen = (item) => {
    setSelectedArtwork(item);
    setShowArtworkModal(true);
  };

  const handlePlaceModalOpen = (item) => {
    setSelectedPlace(item);
    setShowPlaceModal(true);
  };

  return (
    <SafeAreaView
      style={{
        width: "95%",
        marginHorizontal: "auto",
        flexDirection: "column",
        flex: 1,
        position: "relative",
        paddingBottom: 60,
      }}
    >
      <View style={{ paddingBottom: 80, padding: 10 }}>
        <TouchableOpacity style={{ alignItems: "center" }}>
          <Mainlogo
            width={150}
            height={50}
            onPress={() => navigation.navigate("Bottom", { screen: "Home" })}
          />
        </TouchableOpacity>

        <SearchBar />
        <View style={styles.settingFactorContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              style={{ margin: 8 }}
              onPress={() => navigation.goBack()}
            >
              <BackwardIcon width={32} height={32} fill="#000" />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 22,
                color: "black",
                fontWeight: "bold",
              }}
            >
              북마크
            </Text>
          </View>
          <View style={styles.btnContainer}>
            <TouchableOpacity
              onPress={() => setTab("artwork")}
              style={styles.btnFactor}
            >
              <Text
                style={{
                  color: tab === "artwork" ? "white" : "#a9a9a9",
                  textAlign: "center",
                  fontWeight: tab === "artwork" ? "bold" : "semibold",
                }}
              >
                작품
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTab("place")}
              style={styles.btnFactor}
            >
              <Text
                style={{
                  color: tab === "place" ? "white" : "#a9a9a9",
                  textAlign: "center",
                  fontWeight: tab === "place" ? "bold" : "semibold",
                }}
              >
                장소
              </Text>
            </TouchableOpacity>
          </View>
          {tab === "artwork" ? (
            <View style={styles.bookmarksContainer}>
              <FlatList
                data={myBookmarks}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => (
                  <View style={styles.bookmarkData}>
                    <TouchableOpacity
                      onPress={() => handleArtworkModalOpen(item)}
                    >
                      <ImageBackground
                        source={{ uri: item.artworkImgUrl }}
                        style={styles.artworkTumbnail}
                        imageStyle={styles.artworkImage}
                        resizeMode="cover"
                      />
                      <Text
                        style={{
                          margin: 10,
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {item.artworkTitle}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          ) : (
            <View style={styles.bookmarksContainer}>
              <FlatList
                data={myPins}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
                numColumns={2}
                renderItem={({ item }) => (
                  <View style={styles.bookmarkData}>
                    <TouchableOpacity
                      onPress={() => handlePlaceModalOpen(item)}
                    >
                      <ImageBackground
                        source={{ uri: item.placeImgUrl }}
                        style={styles.artworkTumbnail}
                        imageStyle={styles.artworkImage}
                        resizeMode="cover"
                      />
                      <Text
                        style={{
                          margin: 10,
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {item.placeName}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  settingFactorContainer: {
    width: "100%",
    height: "100%",
  },
  btnContainer: {
    width: "95%",
    marginHorizontal: "auto",
    marginTop: 20,
    justifyContent: "center",
    flexDirection: "row",
  },
  btnFactor: {
    backgroundColor: colors.primary,
    width: "50%",
    padding: 10,
    justifyContent: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 0.3,
    borderColor: colors.gray,
  },
  bookmarksContainer: {
    flex: 1,
    width: "95%",
    justifyContent: "center",
    marginHorizontal: "auto",
    flexDirection: "column",
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  bookmarkData: {
    width: "44%",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    padding: 8,
    margin: 10,
    flexDirection: "column",
    flex: 1,
  },
  artworkTumbnail: {
    width: 110,
    height: 130,
    borderColor: colors.black,
    borderwidth: 1,
    marginHorizontal: "auto",
    marginVertical: 10,
  },
  artworkImage: {
    borderRadius: 10,
  },
});
