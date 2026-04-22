import { useEffect, useMemo, useRef, useState } from "react";

export default function useRecommendArtworks(artworks, parseDateSafe) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const recommendedArtworks = useMemo(() => {
    if (!artworks?.length) return [];

    const today = new Date();

    const active = artworks.filter((item) => {
      const end = parseDateSafe(item.endDate);
      return end && end >= today;
    });

    const withThumbnail = active.filter((item) =>
      item.thumbnail?.startsWith("http"),
    );

    // 🔥 랜덤 셔플
    const shuffled = [...withThumbnail];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 5);
  }, [artworks, parseDateSafe]);

  useEffect(() => {
    if (recommendedArtworks.length === 0) return;

    const id = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % recommendedArtworks.length;

        flatListRef.current?.scrollToIndex({
          index: next,
          animated: true,
          viewPosition: 0.5,
        });

        return next;
      });
    }, 5000);

    return () => clearInterval(id);
  }, [recommendedArtworks]);

  const goToIndex = (index) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });

    setCurrentIndex(index);
  };

  return {
    recommendedArtworks,
    currentIndex,
    setCurrentIndex,
    flatListRef,
    goToIndex,
  };
}
