import { useEffect, useRef, useState } from "react";

export default function useRecommendArtworks(artworks, parseDateSafe) {
  const [recommendedArtworks, setRecommendedArtworks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const getRandomItems = (array, count) => {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  };

  useEffect(() => {
    if (!artworks || artworks.length === 0) {
      setRecommendedArtworks([]);
      return;
    }

    const today = new Date();

    const active = artworks.filter((item) => {
      const end = parseDateSafe(item.endDate);
      return end && end >= today;
    });

    const withThumbnail = active.filter(
      (item) => item.thumbnail && item.thumbnail.startsWith("http"),
    );

    setRecommendedArtworks(getRandomItems(withThumbnail, 5));
  }, [artworks]);

  // 자동 슬라이드
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
