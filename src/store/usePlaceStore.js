import { create } from "zustand";

export const usePlaceStore = create((set) => ({
  gallery: [],
  details: {},
  loading: false,
  isFetchingMore: false,
  hasMore: true,
  pageNum: 1,
  userLocation: null,

  setGallery: (value) =>
    set((state) => ({
      gallery: typeof value === "function" ? value(state.gallery) : value,
    })),

  setDetails: (value) =>
    set((state) => ({
      details: typeof value === "function" ? value(state.details) : value,
    })),

  setLoading: (value) =>
    set((state) => ({
      loading: typeof value === "function" ? value(state.loading) : value,
    })),

  setIsFetchingMore: (value) =>
    set((state) => ({
      isFetchingMore:
        typeof value === "function" ? value(state.isFetchingMore) : value,
    })),

  setHasMore: (value) =>
    set((state) => ({
      hasMore: typeof value === "function" ? value(state.hasMore) : value,
    })),

  setPageNum: (value) =>
    set((state) => ({
      pageNum: typeof value === "function" ? value(state.pageNum) : value,
    })),

  setUserLocation: (value) =>
    set((state) => ({
      userLocation:
        typeof value === "function" ? value(state.userLocation) : value,
    })),

  resetPlaceStore: () =>
    set({
      gallery: [],
      details: {},
      loading: false,
      isFetchingMore: false,
      hasMore: true,
      pageNum: 1,
      userLocation: null,
    }),
}));
