import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ImageBackground,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackwardIcon from "../../assets/icons/backward.svg";
import Mainlogo from "../../assets/icons/logo-main.svg";
import { AuthContext } from "../../store/context";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import SearchBar from "../../components/search/SearchBar";
import ArtworkInfoModal from "../../components/modals/ArtworkInfoModal";

export default function History({ navigation }) {
  const [myhistory, setMyHistory] = useState([]);
  const { user } = useContext(AuthContext);
  const [showArtworkModal, setShowArtworkModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const reviewPreview = myhistory.map((r) => ({
    seq: r.seq,
    image: r.images?.[0],
    title: r.title,
    rating: r.rating,
    visitedDate: r.visitedDate,
    content: r.content,
  }));

  useEffect(() => {
    getHistory(user.uid);
  }, []);

  const getHistory = async (uid) => {
    try {
      const snapshot = await getDocs(collection(db, "users", uid, "reviews"));

      const history = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyHistory(history);
      //   console.log("history:", history);
      navigation.navigate("History");
    } catch (error) {
      console.error("북마크 불러오기 에러:", error);
    }
  };

  const handleModalOpen = (item) => {
    setSelectedArtwork(item);
    setShowArtworkModal(true);
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
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
              관람기록
            </Text>
          </View>
          <View style={styles.Container}>
            <FlatList
              data={reviewPreview}
              keyExtractor={(item) => item.id}
              // contentContainerStyle={{ paddingBottom: 100 }}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleModalOpen(item)}>
                  <View style={styles.historyContainer}>
                    <ImageBackground
                      source={{ uri: item.image }}
                      style={styles.artworkTumbnail}
                      imageStyle={styles.artworkImage}
                      resizeMode="cover"
                    />
                    <View
                      style={{
                        width: "50%",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                      }}
                    >
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.desc}>나의 점수 {item.rating}/5</Text>
                      <Text style={styles.desc}>{item.visitedDate} 방문</Text>
                      <Text style={styles.content}>{item.content}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  settingFactorContainer: {
    width: "100%",
    height: "100%",
  },
  Container: {
    height: "100%",
    width: "95%",
    marginHorizontal: "auto",
    marginTop: 20,
    flexDirection: "row",
    padding: 10,
  },
  historyContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#608D00",
    borderRadius: 10,
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  artworkTumbnail: {
    width: 130,
    height: 180,
    borderColor: "black",
    borderwidth: 1,
    marginHorizontal: "auto",
    marginVertical: 10,
  },
  artworkImage: {
    borderRadius: 10,
  },
  title: {
    margin: 10,
    fontSize: 12,
    fontWeight: "bold",
  },
  desc: {
    marginVertical: 2,
    marginHorizontal: 10,
    fontSize: 10,
    color: "#a0a0a0",
  },
  content: {
    margin: 10,
    fontSize: 12,
    color: "#6b6b6b",
  },
});
