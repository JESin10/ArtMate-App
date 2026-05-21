import { ExhibitionItem } from "../types/exhibition";
import { parseDateSafe } from "./date";

// 날짜 가까운 순 정렬
export const computeRecentArtworks = (
  artworks: ExhibitionItem[],
) => {
  const today = new Date();

  return artworks
    .map((artwork) => {
      const start = parseDateSafe(artwork.startDate) || today;

      return {
        ...artwork,
        start,
      };
    })
    .sort((a, b) => {
      const aDiff = Math.abs(a.start.getTime() - today.getTime());
      const bDiff = Math.abs(b.start.getTime() - today.getTime());

      return aDiff - bDiff;
    });
};

// 종료일 기준 정렬
export const computeEndedArtworks = (
  items: ExhibitionItem[],
): ExhibitionItem[] => {
  const today = new Date();

  const mapped = items
    .map((it) => ({
      raw: it,
      end: parseDateSafe(it.endDate),
    }))
    .filter(
      (
        x,
      ): x is {
        raw: ExhibitionItem;
        end: Date;
      } => x.end !== null,
    );

  mapped.sort((a, b) => {
    const aFuture = a.end >= today;
    const bFuture = b.end >= today;

    if (aFuture !== bFuture) {
      return aFuture ? -1 : 1;
    }

    return (
      Math.abs(a.end.getTime() - today.getTime()) -
      Math.abs(b.end.getTime() - today.getTime())
    );
  });

  return mapped.map((item) => item.raw);
};

// place 기준 그룹화
export const groupByPlace = (
  items: ExhibitionItem[],
): Record<string, ExhibitionItem[]> => {
  return items.reduce<Record<string, ExhibitionItem[]>>(
    (acc, item) => {
      const key = item.place || "기타";

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(item);

      return acc;
    },
    {},
  );
};