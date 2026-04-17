export const normalizeArtwork = (item) => ({
  seq: item.seq,
  title: item.title,
  thumbnail: item?.thumbnail?.replace("http:", "https:"),
  startDate: item.startDate,
  endDate: item.endDate,
});
