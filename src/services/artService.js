export const fetchDetailArtwork = async (seq) => {
  const response = await fetch(
    `${process.env.REACT_APP_SERVER_URL}/detail2?serviceKey=${process.env.REACT_APP_API_KEY}&seq=${seq}`,
  );

  return await response.text();
};

export const fetchArtwork = async (nextPage, listCnt) => {
  const response = await fetch(
    `${process.env.REACT_APP_SERVER_URL}/area2?serviceKey=${
      process.env.REACT_APP_API_KEY
    }&PageNo=${nextPage}&numOfrows=${listCnt}`,
  );

  return await response.text();
};
