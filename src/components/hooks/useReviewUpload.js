import { useContext, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
  doc,
} from "firebase/firestore";
import { db, storage } from "../../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AuthContext } from "../../services/context";

export const useReviewUpload = (userId, seq) => {
  const [isLoading, setIsLoading] = useState(false);

  const uploadImages = async (images) => {
    if (!userId) throw new Error("User ID 없음");

    const uploadedUrls = [];

    for (let i = 0; i < images.length; i++) {
      const asset = images[i];
      if (!asset?.uri) continue;

      try {
        const fileName = `photo_${Date.now()}_${i}.jpg`;
        const storageRef = ref(
          storage,
          `reviews/${userId}/${Date.now()}_${fileName}`,
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

  const addReview = async ({
    title,
    content,
    rating,
    visitedDate,
    images,
    displayName,
    photoURL,
  }) => {
    if (!userId || !seq) throw new Error("userId 또는 artworkId 없음");

    setIsLoading(true);

    try {
      const imageUrls = await uploadImages(images);

      const newReviewRef = await addDoc(collection(db, "reviews"), {
        userId,
        seq,
        title,
        content,
        rating,
        images: imageUrls,
        LikeCnt: 0,
        CommentCnt: 0,
        createdAt: serverTimestamp(),
        visitedDate,
        displayName,
        photoURL,
      });

      await setDoc(doc(db, "users", userId, "reviews", newReviewRef.id), {
        seq,
        title,
        content,
        rating,
        images: imageUrls,
        LikeCnt: 0,
        CommentCnt: 0,
        createdAt: serverTimestamp(),
        visitedDate,
      });

      return newReviewRef.id;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, addReview };
};
