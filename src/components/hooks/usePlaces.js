import { useEffect, useState } from "react";
import { XMLParser } from "fast-xml-parser";

export default function usePlaces() {
  const [gallery, setGallery] = useState([]);
  const [details, setDetails] = useState({});
  const [artworks, setArtworks] = useState([]);
  const [pageNum, setPageNum] = useState(1);

  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const listCnt = 20;

  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  useEffect(() => {
    getPlace(1);
    getArtwork();
  }, []);

  const getPlace = async (nextPage = 1) => {
    if (!hasMore && nextPage !== 1) return;

    if (nextPage === 1) setLoading(true);
    else setIsFetchingMore(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_PLACE_SERVER_URL}/artgallery?serviceKey=${process.env.REACT_APP_API_KEY}&PageNo=${nextPage}&numOfrows=${listCnt}`,
      );

      const xmlText = await response.text();
      const jsonData = parser.parse(xmlText);
      const rawItems = jsonData?.response?.body?.items?.item || [];
      const items = Array.isArray(rawItems) ? rawItems : [rawItems];

      if (items.length < listCnt) setHasMore(false);

      if (nextPage === 1) setGallery(items);
      else setGallery((prev) => [...prev, ...items]);

      const detailPromises = items.map(async (item) => {
        try {
          const res = await fetch(
            `${process.env.REACT_APP_PLACE_SERVER_URL}/detail?serviceKey=${process.env.REACT_APP_API_KEY}&seq=${item.seq}`,
          );

          const xml = await res.text();
          const json = parser.parse(xml);

          return {
            seq: item.seq,
            detail: json?.response?.body?.items?.item,
          };
        } catch (err) {
          console.error(err);
          return null;
        }
      });

      const results = await Promise.all(detailPromises);

      setDetails((prev) => {
        const newMap = { ...prev };

        results.forEach((r) => {
          if (r) newMap[r.seq] = r.detail;
        });

        return newMap;
      });

      setPageNum(nextPage);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
    setIsFetchingMore(false);
  };

  const loadMore = () => {
    if (!isFetchingMore && hasMore) {
      getPlace(pageNum + 1);
    }
  };

  const getArtwork = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/area2?serviceKey=${process.env.REACT_APP_API_KEY}&PageNo=1&numOfrows=40`,
      );

      const xmlText = await response.text();
      const jsonData = parser.parse(xmlText);
      const rawItems = jsonData?.response?.body?.items?.item || [];
      const list = Array.isArray(rawItems) ? rawItems : [rawItems];

      const normalized = list.map((it) => ({
        seq: it?.seq,
        title: it?.title,
        gpsX: it?.gpsX,
        gpsY: it?.gpsY,
      }));

      setArtworks(normalized);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    gallery,
    details,
    artworks,
    loading,
    isFetchingMore,
    loadMore,
  };
}
