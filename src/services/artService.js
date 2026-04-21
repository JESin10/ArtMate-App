const request = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }

  return await response.text();
};

export const fetchDetailArtwork = async (seq) => {
  return request(
    `${process.env.REACT_APP_SERVER_URL}/detail2?serviceKey=${process.env.REACT_APP_API_KEY}&seq=${seq}`,
  );
};

export const fetchArtwork = async (nextPage, listCnt) => {
  return request(
    `${process.env.REACT_APP_SERVER_URL}/area2?serviceKey=${
      process.env.REACT_APP_API_KEY
    }&PageNo=${nextPage}&numOfrows=${listCnt}`,
  );
};
