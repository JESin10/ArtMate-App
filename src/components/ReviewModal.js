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
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../services/context";

export default function ReviewModal({ visible, onClose }) {
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

  const addUserReview = async (
    userId,
    artworkId,
    content,
    rating,
    visitedDate,
  ) => {
    try {
      const userReviewRef = collection(db, "users", userId, "reviews");
      await addDoc(userReviewRef, {
        artworkId,
        title,
        content,
        rating,
        LikeCnt,
        CommentCnt,
        createdAt: serverTimestamp(),
        visitedDate: visitedDate.toISOString().split("T")[0],
      });

      const allReviewsRef = collection(db, "reviews");
      await addDoc(allReviewsRef, {
        userId,
        title,
        artworkId,
        content,
        rating,
        LikeCnt,
        CommentCnt,
        createdAt: serverTimestamp(),
        visitedDate: visitedDate.toISOString().split("T")[0],
      });

      Alert.alert("리뷰 작성 완료!");
    } catch (error) {
      console.error("리뷰 작성 실패:", error);
    }
  };

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
                <Text>방문 날짜: {visitedDate.toString().split("T")[0]}</Text>
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
                title="리뷰 작성"
                onPress={() =>
                  addUserReview(
                    user.uid,
                    artworkId,
                    content,
                    rating,
                    visitedDate,
                  )
                }
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
