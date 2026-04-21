import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  addDoc,
  collection,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";

export const FollowUser = async ({
  user,
  targetUser,
  isFollowing,
  expireAt,
}) => {
  const targetUserId = targetUser.id;

  const followingRef = doc(db, "users", user.uid, "following", targetUserId);
  const followerRef = doc(db, "users", targetUserId, "followers", user.uid);

  if (isFollowing) {
    await deleteDoc(followingRef);
    await deleteDoc(followerRef);

    await updateDoc(doc(db, "users", user.uid), {
      followingCnt: increment(-1),
    });

    await updateDoc(doc(db, "users", targetUserId), {
      followerCnt: increment(-1),
    });
  } else {
    await setDoc(followingRef, {
      displayName: targetUser.displayName,
      photoURL: targetUser.photoURL || null,
      createdAt: serverTimestamp(),
    });

    await setDoc(followerRef, {
      displayName: user.displayName,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "users", user.uid), {
      followingCnt: increment(1),
    });

    await updateDoc(doc(db, "users", targetUserId), {
      followerCnt: increment(1),
    });

    if (user.uid !== targetUserId) {
      await addDoc(collection(db, "users", targetUserId, "notifications"), {
        type: "follow",
        fromUserId: user.uid,
        fromUserName: user.displayName,
        fromUserPhoto: user.photoURL,
        createdAt: serverTimestamp(),
        expireAt,
        isRead: false,
      });
    }
  }
};

export const deleteFollowNotification = async (targetUserId, currentUserId) => {
  try {
    const q = query(
      collection(db, "users", targetUserId, "notifications"),
      where("type", "==", "follow"),
      where("fromUserId", "==", currentUserId),
    );

    const snapshot = await getDocs(q);

    const promises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));

    await Promise.all(promises);
  } catch (error) {
    console.error("팔로우 알림 삭제 실패:", error);
  }
};
