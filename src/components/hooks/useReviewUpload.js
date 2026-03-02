// hooks/useReviewForm.js
import { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
  doc,
} from "firebase/firestore";
import { db, storage } from "../../../firebase";
import * as FileSystem from "expo-file-system";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const useReviewUpload = (userId, artworkId) => {
  const [isloading, setIsLoading] = useState(false);

  // 이미지 업로드 함수
  const uploadImages = async (images, userId) => {
    if (!userId) {
      console.error("유저 ID가 없습니다.");
      return [];
    }

    const uploadedUrls = [];

    for (let i = 0; i < images.length; i++) {
      const asset = images[i];
      if (!asset?.uri) {
        console.warn("이미지 URI 없음:", asset);
        continue;
      }

      try {
        // 파일 이름 설정
        const fileName = asset.fileName || `photo_${Date.now()}_${i}.jpg`;
        const storageRef = ref(
          storage,
          `reviews/${userId}/${Date.now()}_${fileName}`,
        );

        // ✅ Expo iOS/Android 호환 fetch + blob
        const response = await fetch(asset.uri);
        const blob = await response.blob();

        // 업로드
        await uploadBytes(storageRef, blob);

        // 다운로드 URL
        const downloadURL = await getDownloadURL(storageRef);
        uploadedUrls.push(downloadURL);

        console.log("✅ 업로드 완료:", downloadURL);
      } catch (error) {
        console.error("🔥 이미지 업로드 실패:", asset.uri, error);
      }
    }

    return uploadedUrls;
  };

  // 리뷰 작성 함수
  const addReview = async ({ title, content, rating, visitedDate, images }) => {
    if (!userId || !artworkId)
      throw new Error("User ID 또는 artworkId가 없습니다.");
    setIsLoading(true);
    try {
      const imageUrls = await uploadImages(images);

      const newReviewRef = await addDoc(collection(db, "reviews"), {
        userId,
        artworkId,
        title,
        content,
        rating,
        images: imageUrls,
        LikeCnt: 0,
        CommentCnt: 0,
        createdAt: serverTimestamp(),
        visitedDate,
      });

      await setDoc(doc(db, "users", userId, "reviews", newReviewRef.id), {
        artworkId,
        title,
        content,
        rating,
        images: imageUrls,
        LikeCnt: 0,
        CommentCnt: 0,
        createdAt: serverTimestamp(),
        visitedDate,
      });

      setIsLoading(false);
      return newReviewRef.id;
    } catch (error) {
      setIsLoading(false);
      console.error("리뷰 작성 실패:", error);
      throw error;
    }
  };

  return { isloading, uploadImages, addReview };
};
