import { create } from "zustand";

export const useArtStore = create((set) => ({
  artworks: [],
  detailArtwork: [],
  displayedArtworks: [],
  loading: false,

  setArtworks: (data) => set({ artworks: data }),
  setDetailArtwork: (data) => set({ detailArtwork: data }),
  setDisplayedArtworks: (data) => set({ displayedArtworks: data }),
  setLoading: (value) => set({ loading: value }),
}));
