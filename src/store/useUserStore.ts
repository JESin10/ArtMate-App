import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../../firebase";
import { Review } from "../types/review";

interface SavedItem {
  id: string;
  seq: string;
  createdAt?: any;
}

interface CommentItem {
  id: string;
  content?: string;
  createdAt?: any;
}

interface UserStore {
  followingMap: Record<string, boolean>;
  followerMap: Record<string, boolean>;
  bookmarkMap: Record<string, boolean>;
  pinMap: Record<string, boolean>;

  myReviews: Review[];
  myLikedReviews: Review[];
  myLikeRV: Review[];
  myComments: CommentItem[];
  myBookmarks: SavedItem[];
  myPins: SavedItem[];

  unreadCount: number;

  setFollowingMap: (data: Record<string, boolean>) => void;
  setFollowerMap: (data: Record<string, boolean>) => void;
  setMyReviews: (data: Review[]) => void;
  setMyLikedReviews: (data: Review[]) => void;
  setMyLikeRV: (data: Review[]) => void;
  setMyComments: (data: CommentItem[]) => void;
  setMyBookmarks: (items: SavedItem[]) => void;
  setMyPins: (items: SavedItem[]) => void;
  setUnreadCount: (count: number) => void;

  subscribeBookmarks: (uid: string) => () => void;
  subscribePins: (uid: string) => () => void;

  clearUserStore: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  followingMap: {},
  followerMap: {},
  bookmarkMap: {},
  pinMap: {},

  myReviews: [],
  myLikedReviews: [],
  myLikeRV: [],
  myComments: [],
  myBookmarks: [],
  myPins: [],

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
    const q = query(collection(db, "users", uid, "bookmarks"), orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      set({ myBookmarks: data });
    });
  },

  subscribePins: (uid) => {
    const q = query(collection(db, "users", uid, "pins"), orderBy("createdAt", "desc"));

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

      bookmarkMap: {},
      pinMap: {},

      myReviews: [],
      myLikedReviews: [],
      myLikeRV: [],

      myComments: [],

      myBookmarks: [],
      myPins: [],

      unreadCount: 0,
    }),
}));
