import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { Alert } from "react-native";
import { db, storage } from "../../firebase";

interface ImageAsset {
  uri: string;
}

interface ReviewBlankData { 
  title:string, 
  content:string,
  rating:number,
  visitedDate:Date,
  images:ImageAsset[],
  displayName:string,
  photoURL:string,
}

export const reviewService = (userId:string, seq:string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const uploadImages = async (images:ImageAsset[]): Promise<string[]> => {
    if (!userId) throw new Error("User ID 없음");

    const uploadedUrls: string[] = [];

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
      } catch (error:any) {
        Alert.alert(error.code, error.message);
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
  }: ReviewBlankData)
  : Promise<string> => {
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
