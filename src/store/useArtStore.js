import { create } from "zustand";

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
    set((state) => ({
      artworks: typeof value === "function" ? value(state.artworks) : value,
    })),

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
}));
