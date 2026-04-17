import { create } from "zustand";

export const useArtStore = create((set) => ({
  artworks: [],
  displayedArtworks: [],
  loading: false,

  setArtworks: (value) =>
    set((state) => ({
      artworks: typeof value === "function" ? value(state.artworks) : value,
    })),

  setDisplayedArtworks: (value) =>
    set((state) => ({
      displayedArtworks:
        typeof value === "function" ? value(state.displayedArtworks) : value,
    })),

  setLoading: (value) => set({ loading: value }),
}));
