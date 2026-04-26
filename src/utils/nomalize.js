export const normalizePlace = (item) => {
  if (!item) return null;

  const thumbnail = item?.thumbnail?.startsWith("http:")
    ? item.thumbnail.replace("http:", "https:")
    : item?.thumbnail;

  return {
    id: String(item.seq),
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

export const normalizeArtwork = (item) => {
  if (!item) return null;

  const thumbnail = item?.thumbnail?.startsWith("http:")
    ? item.thumbnail.replace("http:", "https:")
    : item?.thumbnail;

  return {
    id: String(item.seq),
    title: item.title || "제목 없음",

    serviceName: item.serviceName, // 👈 추가

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
