import { parseDateSafe } from "./date";

export const normalizeArtwork = (item) => ({
  seq: item.seq,
  title: item.title,
  thumbnail: item?.thumbnail?.replace("http:", "https:"),
  startDate: item.startDate,
  endDate: item.endDate,
});

// artworks 배열을 받아 DP_START 기준으로 현재 날짜와 가까운 순으로 정렬하여 설정
export const computeRecentArtworks = (artworks) => {
  const today = new Date();

  return artworks
    .map((artwork) => {
      const start = parseDateSafe(artwork.startDate) || today;
      return { ...artwork, start };
    })
    .sort((a, b) => {
      const aDiff = Math.abs(a.start - today);
      const bDiff = Math.abs(b.start - today);
      return aDiff - bDiff;
    });
};

// artworks 배열을 받아 DP_END 기준으로 현재 날짜와 가까운 순으로 정렬하여 설정

export const computeEndedArtworks = (items) => {
  const today = new Date();

  const mapped = items
    .map((it) => ({
      raw: it,
      end: parseDateSafe(it.endDate),
    }))
    .filter((x) => x.end);

  mapped.sort((a, b) => {
    const aFuture = a.end >= today;
    const bFuture = b.end >= today;

    if (aFuture !== bFuture) {
      return aFuture ? -1 : 1;
    }

    return Math.abs(a.end - today) - Math.abs(b.end - today);
  });

  return mapped.map((item) => item.raw);
};

//place별로 묶기
export const groupByPlace = (items) => {
  return items.reduce((acc, item) => {
    const key = item.place || "기타";

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});
};
