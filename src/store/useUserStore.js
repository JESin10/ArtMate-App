import { create } from "zustand";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export const useUserStore = create((set) => ({
  followingMap: {},
  followerMap: {},

  myReviews: [],
  myLikedReviews: [],
  myLikeRV: [],
  myComments: [],
  myBookmarks: [],
  myPins: [],
  bookmarkMap: {},
  pinMap: {},
  unreadCount: 0,

  setFollowingMap: (data) => set({ followingMap: data }),
  setFollowerMap: (data) => set({ followerMap: data }),

  setMyReviews: (data) => set({ myReviews: data }),
  setMyLikeRV: (data) => set({ myLikeRV: data }),
  setMyLikedReviews: (data) => set({ myLikedReviews: data }),
  setMyComments: (data) => set({ myComments: data }),
  setMyBookmarks: (items) =>
    set({
      myBookmarks: items,
      bookmarkMap: Object.fromEntries(items.map((item) => [item.seq, true])),
    }),

  setMyPins: (items) =>
    set({
      myPins: items,
      pinMap: Object.fromEntries(items.map((item) => [item.seq, true])),
    }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  subscribeBookmarks: (uid) => {
    const q = query(
      collection(db, "users", uid, "bookmarks"),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      set({ myBookmarks: data });
    });
  },

  subscribePins: (uid) => {
    const q = query(
      collection(db, "users", uid, "pins"),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      set({ myPins: data });
    });
  },

  clearUserStore: () =>
    set({
      followingMap: {},
      followerMap: {},
      myReviews: [],
      myLikedReviews: [],
      myComments: [],
      unreadCount: 0,
    }),
}));
