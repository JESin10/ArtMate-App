const request = async (url:string) :Promise<string>=> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }

  return await response.text();
};

export const fetchDetailArtwork = async (seq:string):Promise<string> => {
  return request(
    `${process.env.EXPO_PUBLIC_SERVER_URL}/detail2?serviceKey=${process.env.EXPO_PUBLIC_API_KEY}&seq=${seq}`,
  );
};

export const fetchArtwork = async (nextPage:number, listCnt:number ):Promise<string> => {
  return request(
    `${process.env.EXPO_PUBLIC_SERVER_URL}/area2?serviceKey=${
      process.env.EXPO_PUBLIC_API_KEY
    }&PageNo=${nextPage}&numOfrows=${listCnt}`,
  );
};
