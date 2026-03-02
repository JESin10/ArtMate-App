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
  // const artworkId = "319005"; // 실제로는 선택된 작품의 ID를 받아와야 함
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

  // console.log(selectedArtwork);
  const handleConfirm = (date) => {
    setVisitedDate(date); // 선택한 날짜로 상태 갱신
    setDatePickerVisible(false);
  };

  useEffect(() => {
    if (selectedArtwork) {
      setTitle(selectedArtwork.name);
    }
  }, [selectedArtwork]);

  // useEffect(() => {
  //   (async () => {
  //     const { status } =
  //       await ImagePicker.requestMediaLibraryPermissionsAsync();
  //     if (status !== "granted") {
  //       Alert.alert("사진 접근 권한이 필요합니다.");
  //     }
  //   })();
  // }, []);

  // const addUserReview = async () => {
  //   if (!selectedArtwork) {
  //     Alert.alert("전시를 먼저 선택해주세요.");
  //     return;
  //   }

  //   if (!user) {
  //     Alert.alert("로그인이 필요합니다.");
  //     return;
  //   }
  //   const imageUrls = await uploadImages(); // 👈 추가
  //   console.log("imageUrls:", imageUrls);
  //   try {
  //     const newReviewRef = await addDoc(collection(db, "reviews"), {
  //       userId: user.uid,
  //       artworkId,
  //       title,
  //       content,
  //       rating,
  //       images: imageUrls, // 👈 저장
  //       LikeCnt: 0,
  //       CommentCnt: 0,
  //       createdAt: serverTimestamp(),
  //       visitedDate: visitedDate.toISOString().split("T")[0],
  //     });

  //     await setDoc(doc(db, "users", user.uid, "reviews", newReviewRef.id), {
  //       artworkId,
  //       title,
  //       content,
  //       rating,
  //       LikeCnt: 0,
  //       CommentCnt: 0,
  //       images: imageUrls, // 👈 저장
  //       createdAt: serverTimestamp(),
  //       visitedDate: visitedDate.toISOString().split("T")[0],
  //     });

  //     Alert.alert("리뷰 작성 완료!");
  //     onClose();
  //   } catch (error) {
  //     console.error("리뷰 작성 실패:", error);
  //   }
  // };

  const getMyReview = async (userId, reviewId) => {
    try {
      await getDoc(collection(db, "users", userId, "reviews", reviewId));
    } catch (err) {
      console.error("불러오기 실패: ", err);
    }
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

  // const uploadImages = async () => {
  //   try {
  //     console.log("업로드 시작");
  //     console.log(selectedArtwork.id);
  //     if (!user?.uid) return [];

  //     const uploadPromises = image.map(async (asset, index) => {
  //       if (!asset?.uri) return null;

  //       const fileName = asset.fileName ?? `photo_${Date.now()}_${index}.jpg`;

  //       const storageRef = ref(
  //         storage,
  //         `reviews/${user.uid}/${Date.now()}_${fileName}`,
  //       );

  //       console.log("📂 fetch 시작:", asset.uri);

  //       const response = await fetch(asset.uri);
  //       const blob = await response.blob(); // ✅ 핵심

  //       console.log("🚀 upload 시작 직전");

  //       await uploadBytes(storageRef, blob); // ✅ uploadString 아님

  //       console.log("✅ upload 완료");

  //       const downloadURL = await getDownloadURL(storageRef);

  //       return downloadURL;
  //     });

  //     const results = await Promise.all(uploadPromises);

  //     return results.filter(Boolean);
  //   } catch (error) {
  //     console.error("🔥 uploadImages 에러:", error);
  //     return [];
  //   }
  // };

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

  // console.log("selectedArtwork", selectedArtwork);

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
      onClose();
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
                placeholder="전시 제목 검색"
                value={searchKeyword}
                onChangeText={setSearchKeyword}
                style={styles.titleInput}
              />
              {searchKeyword.length > 1 && (
                <View style={{ width: "90%", maxHeight: 200 }}>
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
                          <Text>{item.name}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}
              {selectedArtwork && (
                <View style={{ alignItems: "center", marginVertical: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>
                    선택된 전시: {selectedArtwork.name}
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
                    <View key={img.uri} style={{ marginRight: 10 }}>
                      <Image
                        source={{ uri: img.uri }}
                        style={{ width: 80, height: 80, borderRadius: 8 }}
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setImage(image.filter((_, i) => i !== index))
                        }
                      >
                        <Text style={{ color: "red" }}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    marginTop: 10,
                    padding: 10,
                    backgroundColor: "#eee",
                    alignItems: "center",
                    borderRadius: 8,
                  }}
                >
                  <Text>사진 추가 ({image.length}/3)</Text>
                </TouchableOpacity>
              </View>
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
              {/* <Button
                title={isEditing ? "리뷰 수정" : "리뷰 작성"}
                onPress={isEditing ? updateReview : addUserReview}
              /> */}
              <Button
                title={isLoading ? "업로드 중..." : "리뷰 작성"}
                onPress={handleSubmit}
                disabled={isLoading}
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
