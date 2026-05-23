import { collection, onSnapshot, query, where } from "firebase/firestore";
import { create } from "zustand";

import { db } from "../../firebase";

import { fetchDetailArtwork } from "../services/artService";
import { parseItems } from "../utils/xmlParser";

import { Artwork } from "../types/art";
import { Review } from "../types/review";

interface ArtFilter {
  start: number;
  end: number;
  genres: string[];
  regions: string[];
  minRating: number;
}

interface ArtStore {
  artworks: Artwork[];
  displayedArtworks: Artwork[];
  detailArtwork: Artwork | null;
  reviews: Review[];
  loading: boolean;
  filter: ArtFilter;

  setArtworks: (value: Artwork[] | ((prev: Artwork[]) => Artwork[])) => void;
  setDisplayedArtworks: (value: Artwork[] | ((prev: Artwork[]) => Artwork[])) => void;
  setLoading: (value: boolean) => void;
  setFilter: (value: Partial<ArtFilter>) => void;
  resetFilter: () => void;
  setDetailArtwork: (value: Artwork | null) => void;
  setReviews: (value: Review[]) => void;
  getDetailArtwork: (seq: string) => Promise<void>;
  subscribeReviews: (seq: string) => () => void;
}

const initialFilter: ArtFilter = {
  start: 1,
  end: 60,
  genres: [],
  regions: [],
  minRating: 0,
};

export const useArtStore = create<ArtStore>((set) => ({
  artworks: [],
  displayedArtworks: [],
  detailArtwork: null,
  reviews: [],
  loading: false,
  filter: initialFilter,

  setArtworks: (value) =>
    set((state) => ({
      artworks: typeof value === "function" ? value(state.artworks) : value,
    })),

  setDisplayedArtworks: (value) =>
    set((state) => ({
      displayedArtworks: typeof value === "function" ? value(state.displayedArtworks) : value,
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

  getDetailArtwork: async (seq: string) => {
    set({ loading: true });

    try {
      const xmlText = await fetchDetailArtwork(seq);

      const detail = parseItems(xmlText);

      set({
        detailArtwork: detail[0] || null,
      });
    } catch (error) {
      console.error(error);

      set({
        detailArtwork: null,
      });
    } finally {
      set({
        loading: false,
      });
    }
  },

  subscribeReviews: (seq: string) => {
    const q = query(collection(db, "reviews"), where("artworkId", "==", seq));

    return onSnapshot(q, (snapshot) => {
      const data: Review[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Review, "id">),
      }));

      set({
        reviews: data,
      });
    });
  },
}));
