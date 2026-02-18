import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Button,
} from "react-native";
import React, { useContext, useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  addDoc,
  collection,
  serverTimestamp,
  setDoc,
  increment,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { AuthContext } from "../../services/context";

export default function CommentModal({ visible, onClose }) {
  const { user } = useContext(AuthContext);

  const addComment = async (userId, reviewId, comment) => {
    try {
      // 사용자 서브컬렉션 댓글
      const userCommentRef = collection(db, "users", userId, "comments");
      await addDoc(userCommentRef, {
        reviewId,
        userId,
        comment,
        createdAt: serverTimestamp(),
      });
      //cmt 숫자 +1
      await setDoc(collection(db, "reviews", reviewId), {
        CommentCnt: increment(1),
      });
      await setDoc(
        collection(collection(db, "users", userId, "reviews"), {
          CommentCnt: increment(1),
        }),
      );
      // 리뷰별 댓글
      const reviewCommentRef = collection(db, "reviews", reviewId, "comments");
      await addDoc(reviewCommentRef, {
        userId,
        comment,
        createdAt: serverTimestamp(),
      });

      // 리뷰 문서에 댓글 수 업데이트
      const reviewRef = doc(db, "reviews", reviewId);
      await setDoc(reviewRef, { CommentCnt: increment(1) }, { merge: true });

      console.log("댓글 작성 완료");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
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
            <Text>댓글</Text>
            <View style={styles.allcommentContainer}>
              <View style={styles.cmtContainer}>
                <View style={styles.cmtLineContainer}>
                  <Text style={styles.cmtUser}>Tester</Text>
                  <Text style={styles.cmtText}>comment Test</Text>
                </View>
                <Text style={styles.cmtTime}>2026년2월18일</Text>
              </View>
              <View style={styles.cmtContainer}>
                <View style={styles.cmtLineContainer}>
                  <Text style={styles.cmtUser}>Tester</Text>
                  <Text style={styles.cmtText}>comment Test</Text>
                </View>
                <Text style={styles.cmtTime}>2026년2월18일</Text>
              </View>
            </View>
            {user ? (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.cmtInput}
                  placeholder="댓글을 남겨보세요"
                />
                <TouchableOpacity
                  style={styles.cmtBtn}
                  onPress={() => addComment(user.uid)}
                >
                  <Button title="전송" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <Text style={{ justifyContent: "center", margin: "auto" }}>
                  로그인 후 이용 가능합니다
                </Text>
              </View>
            )}
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
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
    backgroundColor: "gray",
  },
  allcommentContainer: {
    width: "100%",
    height: "90%",
    backgroundColor: "white",
    borderColor: "yellow",
    borderWidth: 1,
    padding: 10,
  },
  inputContainer: {
    width: "100%",
    height: "11%",
    padding: 10,
    borderWidth: 1,
    borderColor: "blue",
    flexDirection: "row",
    alignItems: "center",
  },
  cmtInput: {
    width: "80%",
    height: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "red",
    marginHorizontal: "auto",
    padding: "auto",
    backgroundColor: "white",
    paddingHorizontal: 5,
  },
  cmtBtn: {
    width: "auto",
    height: 40,
    borderColor: "red",
    borderWidth: 1,
    backgroundColor: "white",
    padding: "5",
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
    width: "15%",
    height: 40,
    borderColor: "red",
    borderWidth: 1,
    justifyContent: "center",
    textAlignVertical: "center",
  },
  cmtText: {
    width: "85%",
    height: 40,
    borderColor: "red",
    borderWidth: 1,
    justifyContent: "center",
    textAlignVertical: "center",
  },
  cmtTime: {
    width: "100%",
    height: 20,
    borderColor: "grey",
    borderWidth: 1,
    justifyContent: "flex-end",
  },
});
