import { useEffect, useMemo, useState } from "react";

export default function useRecentArtworks(artworks, parseDateSafe) {
  const RECENT_PER_PAGE = 4;
  const RECENT_TOTAL_ITEMS = 16;

  const [recentPage, setRecentPage] = useState(0);
  const [recentArtworks, setRecentArtworks] = useState([]);

  const recentTotalPages = Math.max(
    1,
    Math.ceil(RECENT_TOTAL_ITEMS / RECENT_PER_PAGE),
  );

  const computeRecentArtworks = (items) => {
    const today = new Date();

    return items
      .map((artwork) => ({
        ...artwork,
        start: parseDateSafe(artwork.startDate) || today,
      }))
      .sort((a, b) => {
        const aDiff = Math.abs(a.start - today);
        const bDiff = Math.abs(b.start - today);
        return aDiff - bDiff;
      });
  };

  useEffect(() => {
    if (!artworks || artworks.length === 0) {
      setRecentArtworks([]);
      return;
    }

    setRecentArtworks(computeRecentArtworks(artworks));
  }, [artworks]);

  useEffect(() => {
    if (recentPage >= recentTotalPages) {
      setRecentPage(0);
    }
  }, [recentArtworks]);

  const filledRecent = useMemo(() => {
    const arr = recentArtworks.slice(0, RECENT_TOTAL_ITEMS);

    while (arr.length < RECENT_TOTAL_ITEMS) {
      arr.push(null);
    }

    return arr;
  }, [recentArtworks]);

  return {
    recentPage,
    setRecentPage,
    setRecentArtworks,
    recentArtworks,
    filledRecent,
    recentTotalPages,
    RECENT_PER_PAGE,
  };
}
