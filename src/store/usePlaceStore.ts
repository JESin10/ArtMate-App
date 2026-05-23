import { create } from "zustand";
import { fetchDetailPlace } from "../services/placeService";
import { DetailPlace, Place } from "../types/place";
import { xmlParser } from "../utils/xmlParser";

interface PlaceStore {
  gallery: Place[];
  detail: DetailPlace | null;
  details: Record<string, DetailPlace>;
  loading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  pageNum: number;
  userLocation: {
    lat: number;
    lng: number;
  } | null;

  setGallery: (value: Place[] | ((prev: Place[]) => Place[])) => void;
  setDetail: (value: DetailPlace | null) => void;
  setDetails: (
    value:
      | Record<string, DetailPlace>
      | ((prev: Record<string, DetailPlace>) => Record<string, DetailPlace>),
  ) => void;
  setLoading: (value: boolean) => void;
  setIsFetchingMore: (value: boolean) => void;
  setHasMore: (value: boolean) => void;
  setPageNum: (value: number) => void;

  setUserLocation: (
    value: {
      lat: number;
      lng: number;
    } | null,
  ) => void;

  getDetailPlace: (seq: string) => Promise<void>;
}
export const usePlaceStore = create<PlaceStore>((set) => ({
  gallery: [],
  detail: null,
  details: {} as Record<string, DetailPlace>,
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
      const item = json?.response?.body?.items?.item as DetailPlace | null;
      set({ detail: item });
    } catch (error) {
      console.error("상세 정보 오류:", error);
      set({ detail: null });
    } finally {
      set({ loading: false });
    }
  },
}));
