// AllReview.js
import { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";

const useAllReview = () => {
  const [reviews, setReviews] = useState([]);
  const [userDisplayNameMap, setUserDisplayNameMap] = useState({});

  useEffect(() => {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, orderBy("createdAt", "desc"));

    const unsubscribeReviews = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(reviewsData);

      const newUserIds = [...new Set(reviewsData.map((r) => r.userId))];
      newUserIds.forEach((uid) => {
        if (!userDisplayNameMap[uid]) {
          const userRef = doc(db, "users", uid);
          const unsubscribeUser = onSnapshot(userRef, (userSnap) => {
            setUserDisplayNameMap((prev) => ({
              ...prev,
              [uid]: userSnap.exists()
                ? userSnap.data().displayName || "익명"
                : "익명",
            }));
          });
          return () => unsubscribeUser();
        }
      });
    });

    return () => unsubscribeReviews();
  }, [userDisplayNameMap]);

  return reviews.map((review) => ({
    ...review,
    displayName: userDisplayNameMap[review.userId] || "익명",
  }));
};

export default useAllReview;
