import { create } from "zustand";

export const useReviewStore = create((set) => ({
  reviews: [],
  likedMap: {},
  loading: false,
  sortType: "like",
  selectedReview: null,
  showModal: false,
  selectedArtworkId: null,

  showCmtModal: false,
  showArtworkModal: false,
  isEditing: false,
  followingMap: {},

  setReviews: (reviews) => set({ reviews }),
  setLikedMap: (likedMap) => set({ likedMap }),
  setLoading: (loading) => set({ loading }),
  setSortType: (sortType) => set({ sortType }),
  setSelectedReview: (review) => set({ selectedReview: review }),
  setSelectedArtworkId: (id) => set({ selectedArtworkId: id }),

  setShowModal: (showModal) => set({ showModal }),

  setShowCmtModal: (showCmtModal) => set({ showCmtModal }),
  setShowArtworkModal: (showArtworkModal) => set({ showArtworkModal }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setFollowingMap: (followingMap) => set({ followingMap }),
}));
