import { create } from "zustand";
import { fetchDetailPlace } from "../services/placeService";
import { xmlParser } from "../utils/xmlParser";

export const usePlaceStore = create((set, get) => ({
  gallery: [],
  detail: null,
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

  setDetail: (value) => set({ detail: value }),
  setDetails: (value) =>
    set((state) => ({
      details: typeof value === "function" ? value(state.details) : value,
    })),

  setLoading: (value) => set({ loading: value }),
  setIsFetchingMore: (value) => set({ isFetchingMore: value }),
  setHasMore: (value) => set({ hasMore: value }),
  setPageNum: (value) => set({ pageNum: value }),
  setUserLocation: (value) => set({ userLocation: value }),

  getDetailPlace: async (seq) => {
    set({ loading: true });

    try {
      const xmlText = await fetchDetailPlace(seq);
      const json = xmlParser(xmlText);
      const item = json?.response?.body?.items?.item || null;

      set({ detail: item });
    } catch (error) {
      console.error("상세 정보 오류:", error);
      set({ detail: null });
    } finally {
      set({ loading: false });
    }
  },
}));