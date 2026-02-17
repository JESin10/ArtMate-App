import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackwardIcon from "../assets/icons/backward.svg";
import { AuthContext } from "../services/context";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function Bookmarks({ navigation }) {
  const [myBookmarks, setMyBookmarks] = useState([]);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookmarks(user.uid);
  }, []);

  const getBookmarks = async (uid) => {
    try {
      const snapshot = await getDocs(collection(db, "users", uid, "bookmarks"));

      const bookmark = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyBookmarks(bookmark);
    } catch (error) {
      console.error("북마크 불러오기 에러:", error);
    }
  };

  console.log("Bookmarks:", myBookmarks);

  return (
    <SafeAreaView>
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
            <Text key={item.id}>{item.artworkTitle}</Text>
          ))}
        </View>
      </View>
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
