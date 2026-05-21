import {
  NormalizedArtwork,
  NormalizedPlace,
  RawExhibitionItem,
} from "../types/exhibition";

export const normalizePlace = (
  item: RawExhibitionItem
): NormalizedPlace | null => {
  if (!item) return null;

  const thumbnail =
    item.thumbnail?.startsWith("http:")
      ? item.thumbnail.replace("http:", "https:")
      : item.thumbnail || null;

  return {
    id: String(item.seq ?? ""),

    title: item.title || "제목 없음",

    period: {
      start: item.startDate,
      end: item.endDate,
    },

    location: {
      lat: Number(item.gpsY) || 0,
      lng: Number(item.gpsX) || 0,
      place: item.place,
      area: item.area,
      sigungu: item.sigungu,
    },

    thumbnail,

    raw: item,
  };
};

export const normalizeArtwork = (
  item: RawExhibitionItem
): NormalizedArtwork | null => {
  if (!item) return null;

  const thumbnail =
    item.thumbnail?.startsWith("http:")
      ? item.thumbnail.replace("http:", "https:")
      : item.thumbnail || null;

  return {
    id: String(item.seq ?? ""),

    title: item.title || "제목 없음",

    serviceName: item.serviceName,

    period: {
      start: item.startDate,
      end: item.endDate,
    },

    location: {
      area: item.area,
    },

    thumbnail,

    raw: item,
  };
};