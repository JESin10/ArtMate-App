export const fetchDetailPlace = async (seq) => {
  const response = await fetch(
    `${process.env.REACT_APP_PLACE_SERVER_URL}/detail?serviceKey=${process.env.REACT_APP_API_KEY}&seq=${seq}`,
  );

  return await response.text();
};

export const fetchPlace = async (nextPage, listCnt) => {
  const response = await fetch(
    `${process.env.REACT_APP_PLACE_SERVER_URL}/artgallery?serviceKey=${process.env.REACT_APP_API_KEY}&PageNo=${nextPage}&numOfrows=${listCnt}`,
  );

  return await response.text();
};
