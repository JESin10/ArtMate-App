import { create } from "zustand";
import { Review } from "../types/review";

interface ReviewStore {
  reviews: Review[];
  likedMap: Record<string, boolean>;
  loading: boolean;
  sortType: "like" | "recent";
  selectedReview: Review | null;
  showModal: boolean;
  selectedArtworkId: string | null;
  showCmtModal: boolean;
  showArtworkModal: boolean;
  isEditing: boolean;
  followingMap: Record<string, boolean>;

  setReviews: (reviews: Review[] | ((prev: Review[]) => Review[])) => void;
  setLikedMap: (
    likedMap:
      | Record<string, boolean>
      | ((prev: Record<string, boolean>) => Record<string, boolean>),
  ) => void;

  setFollowingMap: (
    followingMap:
      | Record<string, boolean>
      | ((prev: Record<string, boolean>) => Record<string, boolean>),
  ) => void;
  setLoading: (loading: boolean) => void;
  setSortType: (sortType: "like" | "recent") => void;
  setSelectedReview: (review: Review | null) => void;
  setShowModal: (showModal: boolean) => void;
  setSelectedArtworkId: (id: string | null) => void;

  setShowCmtModal: (showCmtModal: boolean) => void;
  setShowArtworkModal: (showArtworkModal: boolean) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const useReviewStore = create<ReviewStore>((set) => ({
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

  setReviews: (reviews) =>
    set((state) => ({
      reviews: typeof reviews === "function" ? reviews(state.reviews) : reviews,
    })),
  setLikedMap: (likedMap) =>
    set((state) => ({
      likedMap: typeof likedMap === "function" ? likedMap(state.likedMap) : likedMap,
    })),

  setFollowingMap: (followingMap) =>
    set((state) => ({
      followingMap:
        typeof followingMap === "function" ? followingMap(state.followingMap) : followingMap,
    })),
  setLoading: (loading) => set({ loading }),
  setSortType: (sortType) => set({ sortType }),
  setSelectedReview: (review) => set({ selectedReview: review }),
  setSelectedArtworkId: (id) => set({ selectedArtworkId: id }),
  setShowModal: (showModal) => set({ showModal }),
  setShowCmtModal: (showCmtModal) => set({ showCmtModal }),
  setShowArtworkModal: (showArtworkModal) => set({ showArtworkModal }),
  setIsEditing: (isEditing) => set({ isEditing }),
}));
