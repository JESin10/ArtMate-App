import { create } from "zustand";

export const usePlaceStore = create((set) => ({
  gallery: [],
  details: {},
  loading: false,
  isFetchingMore: false,
  hasMore: true,
  pageNum: 1,
  userLocation: null,

  setGallery: (data) => set({ gallery: data }),
  setDetails: (data) => set({ details: data }),
  setLoading: (value) => set({ loading: value }),
  setIsFetchingMore: (value) => set({ isFetchingMore: value }),
  setHasMore: (value) => set({ hasMore: value }),
  setPageNum: (value) => set({ pageNum: value }),
  setUserLocation: (value) => set({ userLocation: value }),
}));
