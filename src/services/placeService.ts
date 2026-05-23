export const fetchDetailPlace = async (seq:string): Promise<string> => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_PLACE_SERVER_URL}/detail?serviceKey=${process.env.EXPO_PUBLIC_API_KEY}&seq=${seq}`,
  );
  if (!response.ok) {
    throw new Error(`API 요청 실패 : ${response.status}`);
  }
  return await response.text();
};

export const fetchPlace = async (nextPage:number, listCnt:number): Promise<number> => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_PLACE_SERVER_URL}/artgallery?serviceKey=${process.env.EXPO_PUBLIC_API_KEY}&PageNo=${nextPage}&numOfrows=${listCnt}`,
  );

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }

  return await response.text();
};
