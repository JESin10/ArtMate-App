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
  Image,
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
import { useRoute } from "@react-navigation/native";
import useSearch from "../hooks/useSearch";
import * as ImagePicker from "expo-image-picker";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadString,
  getStorage,
} from "firebase/storage";
import { storage } from "../../../firebase";
import * as FileSystem from "expo-file-system";
import { useReviewUpload } from "../hooks/useReviewUpload";
// import storage from "@react-native-firebase/storage";

export default function ReviewModal({
  visible,
  onClose,
  isEditing,
  reviewData,
}) {
  const { user } = useContext(AuthContext);
  const initialState = {
    title: "",
    content: "",
    rating: 0,
    image: [],
    visitedDate: new Date(),
    selectedArtwork: null,
    searchKeyword: "",
  };
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState([]);
  const [visitedDate, setVisitedDate] = useState(new Date());
  const [number, onChangeNumber] = useState("");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const route = useRoute();
  // const { keyword } = route.params;
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const { results, loading } = useSearch(searchKeyword);
  const artworkId = selectedArtwork?.id;
  const { isLoading, addReview } = useReviewUpload(user?.uid, artworkId);

  // console.log(isEditing);
  const handleConfirm = (date) => {
    setVisitedDate(date); // 선택한 날짜로 상태 갱신
    setDatePickerVisible(false);
  };

  useEffect(() => {
    if (selectedArtwork) {
      setTitle(selectedArtwork.name);
    }
  }, [selectedArtwork]);

  const getMyReview = async (userId, reviewId) => {
    try {
      await getDoc(collection(db, "users", userId, "reviews", reviewId));
    } catch (err) {
      console.error("불러오기 실패: ", err);
    }
  };

  const handleClose = () => {
    // 상태 초기화
    setTitle(initialState.title);
    setContent(initialState.content);
    setRating(initialState.rating);
    setImage(initialState.image);
    setVisitedDate(initialState.visitedDate);
    setSelectedArtwork(initialState.selectedArtwork);
    setSearchKeyword(initialState.searchKeyword);

    // 부모에서 전달된 onClose 실행
    onClose();
  };

  const pickImage = async () => {
    if (image.length >= 3) {
      Alert.alert("이미지는 최대 3장까지 가능합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage([...image, result.assets[0]]);
    }
  };

  const uploadImages = async () => {
    if (!user.uid) throw new Error("User ID 없음");

    const uploadedUrls = [];

    for (let i = 0; i < image.length; i++) {
      const asset = image[i];
      if (!asset?.uri) continue;

      try {
        const fileName = `photo_${Date.now()}_${i}.jpg`;
        const storageRef = ref(
          storage,
          `reviews/${user.uid}/${Date.now()}_${fileName}`,
        );

        const response = await fetch(asset.uri);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);
        uploadedUrls.push(downloadURL);
      } catch (error) {
        console.log("전체 에러:", JSON.stringify(error, null, 2));
        console.log("error.code:", error.code);
        console.log("error.message:", error.message);
      }
    }

    return uploadedUrls;
  };

  const updateReview = async () => {
    const imageUrls = await uploadImages();

    try {
      const reviewId = reviewData.id;

      const updateData = {
        title,
        content,
        rating,
        images: imageUrls,
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

  // console.log("selectedArtwork", selectedArtwork);

  const handleSubmit = async () => {
    if (!selectedArtwork) {
      alert("전시를 선택해주세요.");
      return;
    }

    if (!user?.uid) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await addReview({
        title,
        content,
        rating,
        visitedDate: visitedDate.toISOString().split("T")[0],
        images: image,
      });

      alert("리뷰 작성 완료!");
      handleClose();
    } catch (err) {
      console.error("리뷰 작성 실패:", err);
      alert("리뷰 작성 실패");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalBackdrop}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.ModalContainer}>
          <ScrollView
            contentContainerStyle={styles.ModalContent}
            showsVerticalScrollIndicator={true}
          >
            <Text
              style={{
                fontSize: 22,
                marginVertical: 20,
                justifyContent: "center",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              전시회 리뷰
            </Text>
            <View style={styles.inputContainer}>
              {!isEditing && (
                <TextInput
                  placeholder="전시 제목 검색"
                  value={searchKeyword}
                  onChangeText={setSearchKeyword}
                  style={styles.titleInput}
                />
              )}
              {searchKeyword.length > 1 && (
                <View style={styles.searchPage}>
                  <ScrollView>
                    {loading ? (
                      <Text>검색 중...</Text>
                    ) : (
                      results.map((item) => (
                        <TouchableOpacity
                          key={item.seq}
                          onPress={() => {
                            setSelectedArtwork(item);
                            setTitle(item.name); // 👈 TextInput에 들어갈 값
                            setSearchKeyword(""); // 검색창 닫기
                          }}
                        >
                          <Text style={{ color: "white", marginBottom: 10 }}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}
              {selectedArtwork && (
                <View
                  style={{
                    alignItems: "center",
                    marginVertical: 10,
                    width: "90%",
                    justifyContent: "colunm",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    선택된 전시
                  </Text>
                  <Text
                    style={{
                      padding: 10,
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    {selectedArtwork.name}
                  </Text>
                </View>
              )}
              <TextInput
                placeholder="후기내용을 입력하세요"
                editable
                multiline
                maxLength={300}
                onChangeText={setContent}
                value={content}
                style={styles.contentInput}
              />
              <View style={{ width: "90%", marginVertical: 10 }}>
                <ScrollView horizontal>
                  {image.map((img, index) => (
                    <View key={img.uri + index} style={{ marginRight: 10 }}>
                      <Image
                        source={{ uri: img.uri }}
                        style={{ width: 80, height: 80, borderRadius: 8 }}
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setImage(image.filter((_, i) => i !== index))
                        }
                      >
                        <Text style={{ color: "#b50000", marginVertical: 10 }}>
                          삭제
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                {/* <View style={styles.imagePick}> */}
                <TouchableOpacity style={styles.imagePick} onPress={pickImage}>
                  <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                    사진 업로드
                  </Text>
                  <Text style={{ fontSize: 14, color: "#608D00" }}>
                    ({image.length}/3)
                  </Text>
                </TouchableOpacity>
                {/* </View> */}
              </View>
              <TouchableOpacity
                onPress={() => setDatePickerVisible(true)}
                style={styles.datePick}
              >
                <View
                  style={{
                    justifyContent: "space-between",
                    flexDirection: "row",
                    width: "100%",
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                    방문 날짜
                  </Text>
                  <Text style={{ fontSize: 14, color: "#608D00" }}>
                    {visitedDate.toISOString().split("T")[0]}
                  </Text>
                </View>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={() => setDatePickerVisible(false)}
              />

              <View style={styles.ratingPick}>
                <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                  평점 선택
                </Text>
                <View style={{ flexDirection: "row", marginVertical: 10 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TouchableOpacity key={i} onPress={() => setRating(i)}>
                      <Text
                        style={{
                          fontSize: 20,
                          color: i <= rating ? "#608D00" : "gray",
                        }}
                      >
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {isLoading ? (
                <View style={styles.reviewSubBtn}>
                  <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
                    <Text style={styles.reviewSubBtnText}>업로드 중</Text>
                  </TouchableOpacity>
                </View>
              ) : isEditing ? (
                <View style={styles.reviewSubBtn}>
                  <TouchableOpacity onPress={updateReview} disabled={isLoading}>
                    <Text style={styles.reviewSubBtnText}>리뷰 수정</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.reviewSubBtn}>
                  <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
                    <Text style={styles.reviewSubBtnText}>리뷰 작성</Text>
                  </TouchableOpacity>
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
    padding: 30,
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
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#608D00",
    borderRadius: 20,
    borderColor: "transparent",
  },
  searchPage: {
    width: "90%",
    maxHeight: 200,
    marginBottom: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
  },
  titleInput: {
    width: "90%",
    borderWidth: 2,
    backgroundColor: "white",
    borderColor: "transparent",
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
  contentInput: {
    width: "90%",
    height: 300,
    borderWidth: 2,
    backgroundColor: "white",
    borderColor: "transparent",
    borderRadius: 10,
    margin: 10,
    padding: 20,
    lineHeight: 24,
    fontSize: 16,
  },
  imagePick: {
    width: "100%",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#eee",
    alignItems: "center",
    borderRadius: 10,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  datePick: {
    width: "90%",
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#eee",
    alignItems: "center",
    borderRadius: 10,
  },
  ratingPick: {
    width: "90%",
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#eee",
    alignItems: "center",
    borderRadius: 10,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  reviewSubBtn: {
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "#608D00",
    width: "90%",
    padding: 10,
    marginVertical: 22,
  },
  reviewSubBtnText: {
    fontWeight: "bold",
    fontSize: 20,
    color: "white",
    textAlign: "center",
    justifyContent: "center",
  },
});
