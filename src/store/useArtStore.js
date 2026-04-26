import { collection, onSnapshot, query, where } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../../firebase";
import { fetchDetailArtwork } from "../services/artService";
import { parseItems } from "../utils/xmlParser";

const initialFilter = {
  start: 1,
  end: 60,
  genres: [],
  regions: [],
  minRating: 0,
};

export const useArtStore = create((set) => ({
  artworks: [],
  displayedArtworks: [],
  loading: false,

  filter: initialFilter,

  setArtworks: (value) =>
    set((state) => {
      const next = typeof value === "function" ? value(state.artworks) : value;

      return {
        artworks: Array.isArray(next) ? next : [], // 🔥 핵심
      };
    }),

  setDisplayedArtworks: (value) =>
    set((state) => ({
      displayedArtworks:
        typeof value === "function" ? value(state.displayedArtworks) : value,
    })),

  setLoading: (value) => set({ loading: value }),

  setFilter: (value) =>
    set((state) => ({
      filter: {
        ...state.filter,
        ...value,
      },
    })),

  resetFilter: () =>
    set({
      filter: initialFilter,
    }),
  setDetailArtwork: (value) => set({ detailArtwork: value }),
  setReviews: (value) => set({ reviews: value }),

  getDetailArtwork: async (seq) => {
    set({ loading: true });

    try {
      const xmlText = await fetchDetailArtwork(seq);
      const detail = parseItems(xmlText);

      set({
        detailArtwork: detail[0] || null,
      });
    } catch (error) {
      console.error(error);
      set({ detailArtwork: null });
    } finally {
      set({ loading: false });
    }
  },

  subscribeReviews: (seq) => {
    const q = query(collection(db, "reviews"), where("artworkId", "==", seq));

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      set({ reviews: data });
    });
  },
}));
