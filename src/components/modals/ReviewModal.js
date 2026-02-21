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
import React, { useContext, useEffect, useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  addDoc,
  collection,
  getDoc,
  serverTimestamp,
  setDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { AuthContext } from "../../services/context";

export default function ReviewModal({
  visible,
  onClose,
  isEditing,
  reviewData,
}) {
  const { user } = useContext(AuthContext);
  const artworkId = "319005"; // 실제로는 선택된 작품의 ID를 받아와야 함
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [LikeCnt, setLikeCnt] = useState(0);
  const [CommentCnt, setCommentCnt] = useState(0);
  const [visitedDate, setVisitedDate] = useState(new Date());
  const [number, onChangeNumber] = useState("");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const handleConfirm = (date) => {
    setVisitedDate(date); // 선택한 날짜로 상태 갱신
    setDatePickerVisible(false);
  };

  const addUserReview = async () => {
    try {
      const newReviewRef = await addDoc(collection(db, "reviews"), {
        userId: user.uid,
        artworkId,
        title,
        content,
        rating,
        LikeCnt: 0,
        CommentCnt: 0,
        createdAt: serverTimestamp(),
        visitedDate: visitedDate.toISOString().split("T")[0],
        //image
      });

      await setDoc(doc(db, "users", user.uid, "reviews", newReviewRef.id), {
        artworkId,
        title,
        content,
        rating,
        LikeCnt: 0,
        CommentCnt: 0,
        createdAt: serverTimestamp(),
        visitedDate: visitedDate.toISOString().split("T")[0],
      });

      Alert.alert("리뷰 작성 완료!");
      onClose();
    } catch (error) {
      console.error("리뷰 작성 실패:", error);
    }
  };

  const getMyReview = async (userId, reviewId) => {
    try {
      await getDoc(collection(db, "users", userId, "reviews", reviewId));
    } catch (err) {
      console.error("불러오기 실패: ", err);
    }
  };

  const updateReview = async () => {
    try {
      const reviewId = reviewData.id;

      const updateData = {
        title,
        content,
        rating,
        visitedDate: visitedDate.toISOString().split("T")[0],
        updatedAt: serverTimestamp(), // 선택사항 (수정 시간 기록용)
      };

      // 1️⃣ 전체 리뷰 컬렉션 수정 (부분 수정)
      await updateDoc(doc(db, "reviews", reviewId), updateData);

      // 2️⃣ 유저 하위 리뷰 수정 (없으면 생성하되 기존 필드 유지)
      const userReviewRef = doc(db, "users", user.uid, "reviews", reviewId);

      await setDoc(userReviewRef, updateData, { merge: true });

      Alert.alert("리뷰 수정 완료!");
      onClose();
    } catch (error) {
      console.error("리뷰 수정 실패:", error);
    }
  };

  useEffect(() => {
    if (isEditing && reviewData) {
      setTitle(reviewData.title || "");
      setContent(reviewData.content || "");
      setRating(reviewData.rating || 0);
      setVisitedDate(
        reviewData.visitedDate ? new Date(reviewData.visitedDate) : new Date(),
      );
    } else {
      // 🔥 작성 모드일 때 초기화
      setTitle("");
      setContent("");
      setRating(0);
      setVisitedDate(new Date());
    }
  }, [isEditing, reviewData, visible]);

  const StarRating = () => {
    return (
      <View style={{ flexDirection: "row" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <Text
              style={{ fontSize: 30, color: i <= rating ? "gold" : "gray" }}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
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
            <Text>Review 작성 폼</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="전시제목을 입력하세요"
                editable
                multiline
                maxLength={30}
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                placeholder="후기내용을 입력하세요"
                editable
                multiline
                maxLength={300}
                onChangeText={setContent}
                value={content}
                style={styles.contentInput}
              />
              <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                <Text>
                  방문 날짜: {visitedDate.toISOString().split("T")[0]}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={() => setDatePickerVisible(false)}
              />
              <Text>평점 선택</Text>
              <View style={{ flexDirection: "row", marginVertical: 10 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TouchableOpacity key={i} onPress={() => setRating(i)}>
                    <Text
                      style={{
                        fontSize: 30,
                        color: i <= rating ? "gold" : "gray",
                      }}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button
                title={isEditing ? "리뷰 수정" : "리뷰 작성"}
                onPress={isEditing ? updateReview : addUserReview}
              />
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
  ModalContent: { paddingBottom: 20 },
  inputContainer: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "black",
    flexDirection: "column",
    alignItems: "center",
  },
  titleInput: {
    width: "90%",
    borderWidth: 1,
    borderColor: "blue",
    margin: 10,
    padding: 10,
  },
  contentInput: {
    width: "90%",
    height: 300,

    borderWidth: 1,
    borderColor: "red",
    margin: 10,
    padding: 10,
  },
});
