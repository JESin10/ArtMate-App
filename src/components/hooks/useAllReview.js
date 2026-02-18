import { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";

export default function useAllReview() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, orderBy("createdAt", "desc"));

    const unsubscribeReviews = onSnapshot(q, async (snapshot) => {
      const reviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 유저 displayName 한 번만 가져오기
      const userIds = [...new Set(reviewsData.map((r) => r.userId))];
      const displayNameMap = {};

      for (const uid of userIds) {
        try {
          const userSnap = await getDoc(doc(db, "users", uid));
          displayNameMap[uid] = userSnap.exists()
            ? userSnap.data().displayName || "익명"
            : "익명";
        } catch (err) {
          displayNameMap[uid] = "익명";
        }
      }

      // 리뷰 + displayName 합쳐서 상태 업데이트 (한 번만)
      const fetchReview = reviewsData.map((r) => ({
        ...r,
        displayName: displayNameMap[r.userId] || "익명",
      }));
      setReviews(fetchReview);
    });
    return () => {
      unsubscribeReviews();
    }; // 구독 해제
  }, []);

  return reviews; // ✅ 안전하게 반환
}
