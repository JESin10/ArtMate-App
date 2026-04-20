import { create } from "zustand";

export const useUserStore = create((set) => ({
  followingMap: {},
  followerMap: {},

  myReviews: [],
  myLikedReviews: [],
  myLikeRV: [],
  myComments: [],

  unreadCount: 0,

  setFollowingMap: (data) => set({ followingMap: data }),
  setFollowerMap: (data) => set({ followerMap: data }),

  setMyReviews: (data) => set({ myReviews: data }),
  setMyLikeRV: (data) => set({ myLikeRV: data }),
  setMyLikedReviews: (data) => set({ myLikedReviews: data }),
  setMyComments: (data) => set({ myComments: data }),

  setUnreadCount: (count) => set({ unreadCount: count }),

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
