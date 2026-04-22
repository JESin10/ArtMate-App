import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../../firebase";
import { AuthContext } from "../../store/context";
import { colors } from "../../styles/colors";

export default function CommentModal({ visible, onClose, reviewId }) {
  const { user } = useContext(AuthContext);
  const [comment, setComment] = useState("");
  const [cmtList, setCmtList] = useState([]);
  //   console.log("reviewId", reviewId.id);

  useEffect(() => {
    if (!reviewId?.id) return;
    const q = query(
      collection(db, "reviews", reviewId.id, "comments"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 유저 displayName 한 번만 가져오기
      const userIds = [...new Set(data.map((r) => r.userId))];
      const displayNameMap = {};

      for (const uid of userIds) {
        try {
          const userSnap = await getDoc(doc(db, "users", uid));
          displayNameMap[uid] = userSnap.exists()
            ? {
                displayName: userSnap.data().displayName,
                photoURL: userSnap.data().photoURL || null,
              }
            : { displayName: userSnap.data().displayName, photoURL: null };
        } catch (err) {
          displayNameMap[uid] = "익명";
        }
      }

      // 리뷰 + displayName 합쳐서 상태 업데이트 (한 번만)
      const fetchReview = data.map((r) => ({
        ...r,
        displayName: displayNameMap[r.userId]?.displayName,
        photoURL: displayNameMap[r.userId]?.photoURL || null,
      }));
      setCmtList(fetchReview);
    });

    return () => unsubscribe();
  }, [user, reviewId]);

  const formatDate = (timestampObj) => {
    if (!timestampObj) return "";

    const date = new Date(timestampObj.seconds * 1000);

    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  //댓글작성
  const addComment = async (userId, reviewId, comment) => {
    if (!comment.trim()) return;
    try {
      // 1️⃣ 리뷰별 댓글 저장
      const reviewCommentRef = collection(db, "reviews", reviewId, "comments");

      await addDoc(reviewCommentRef, {
        userId,
        comment,
        createdAt: serverTimestamp(),
      });

      // 2️⃣ 사용자 댓글 저장
      const userCommentRef = collection(db, "users", userId, "comments");

      await addDoc(userCommentRef, {
        reviewId,
        comment,
        createdAt: serverTimestamp(),
      });

      // 3️⃣ 리뷰 문서 CommentCnt +1
      const reviewRef = doc(db, "reviews", reviewId);

      await updateDoc(reviewRef, {
        CommentCnt: increment(1),
      });
      setComment("");
      console.log("댓글 작성 완료");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    }
  };

  //댓글 삭제
  const cmtDelete = async (reviewId, userId, cmtId) => {
    try {
      await deleteDoc(doc(db, "reviews", reviewId, "comments", cmtId));
      await deleteDoc(doc(db, "users", userId, "comments", cmtId));
    } catch (error) {
      console.error("댓글 삭제 에러:", error);
      Alert.alert("댓글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.ModalContainer}>
          <ScrollView
            contentContainerStyle={styles.ModalContent}
            showsVerticalScrollIndicator={true}
          >
            <Text
              style={{
                color: colors.primary,
                padding: 10,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              댓글
            </Text>
            <View style={styles.allcommentContainer}>
              {cmtList.map((item, index) => (
                <View style={styles.cmtContainer} key={index}>
                  <View style={styles.cmtLineContainer}>
                    <ImageBackground
                      source={{ uri: item.photoURL }}
                      style={styles.cmtUser}
                      imageStyle={styles.ProfileTumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.cmtText}>
                      <Text>{item.comment}</Text>
                    </View>
                  </View>

                  {user && item.userId === user.uid ? (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Text style={styles.cmtTime}>
                        {formatDate(item.createdAt)}
                      </Text>
                      <TouchableOpacity
                        style={{
                          width: "50%",
                          marginTop: 10,
                        }}
                        onPress={() =>
                          cmtDelete(reviewId.id, user.uid, item.id)
                        }
                      >
                        <Text style={{ textAlign: "right" }}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        textAlign: "right",
                      }}
                    >
                      <Text style={styles.cmtTime}>
                        {formatDate(item.createdAt)}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            <View style={styles.inputFactorContainer}>
              {user ? (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.cmtInput}
                    placeholder="댓글을 남겨보세요"
                    value={comment}
                    onChangeText={setComment}
                    maxLength={100}
                  />
                  <TouchableOpacity
                    style={styles.cmtBtn}
                    onPress={() => addComment(user.uid, reviewId.id, comment)}
                  >
                    <Text
                      style={{
                        color: "white",
                      }}
                    >
                      →
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.inputContainer}>
                  <Text style={{ justifyContent: "center", margin: "auto" }}>
                    로그인 후 이용 가능합니다
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdropTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ModalContainer: {
    backgroundColor: "#fff",
    padding: 32,
    minHeight: 300,
    maxHeight: "80%",
    // height: "80%",
    overflow: "scroll",
    flex: 1,
    flexDirection: "column",
  },
  ModalContent: {
    paddingBottom: 20,
    height: "90%",
    top: 20,
    // backgroundColor: "gray",
  },
  allcommentContainer: {
    width: "100%",
    height: "90%",
    backgroundColor: "white",
    padding: 10,
  },
  inputContainer: {
    width: "100%",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  inputFactorContainer: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cmtInput: {
    width: "85%",
    height: 40,
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 20,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  cmtBtn: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 20,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  cmtContainer: {
    flexDirection: "column",
    marginVertical: 10,
  },
  cmtLineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cmtUser: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderRadius: "100%",
    justifyContent: "center",
    textAlignVertical: "center",
  },
  ProfileTumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: "100%",
    justifyContent: "center",
    textAlignVertical: "center",
  },
  cmtText: {
    width: "85%",
    height: 40,
    paddingHorizontal: 10,
    justifyContent: "center",
    textAlignVertical: "center",
  },
  cmtTime: {
    width: "50%",
    height: 20,
    fontSize: 10,
    color: "grey",
    marginTop: 10,
    // justifyContent: "flex-end",
    // textAlign: "right",
  },
});
