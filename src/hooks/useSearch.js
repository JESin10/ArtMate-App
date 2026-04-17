import { useEffect, useState, useMemo } from "react";
import { XMLParser } from "fast-xml-parser";
import { fetchPlace } from "../services/placeService";
import { fetchArtwork } from "../services/artService";

export default function useSearch(keyword) {
  const [places, setPlaces] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const page = 1;
  const count = 50;

  const parser = useMemo(() => new XMLParser({ ignoreAttributes: false }), []);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [placeRes, artworkRes] = await Promise.all([
        fetchPlace(page, count),
        fetchArtwork(page, count),
      ]);

      const placeJson = parser.parse(placeRes);
      const artworkJson = parser.parse(artworkRes);

      let placeItems = placeJson?.response?.body?.items?.item || [];
      let artworkItems = artworkJson?.response?.body?.items?.item || [];

      if (!Array.isArray(placeItems)) placeItems = [placeItems];
      if (!Array.isArray(artworkItems)) artworkItems = [artworkItems];

      setPlaces(placeItems);
      setArtworks(artworkItems);
      setLoading(false);
    } catch (err) {
      console.log("search fetch error", err);
    }
  };

  const results = useMemo(() => {
    if (!keyword?.trim()) return [];

    const lower = keyword.toLowerCase();

    const placeFiltered = places.filter((item) =>
      item?.culName?.toLowerCase().includes(lower),
    );

    const artworkFiltered = artworks.filter((item) =>
      item?.title?.toLowerCase().includes(lower),
    );

    const artworkPlaceFiltered = artworks.filter((item) =>
      item?.place?.toLowerCase().includes(lower),
    );

    // 🔥 중복 제거용 Map
    const placeMap = new Map();

    placeFiltered.forEach((p) => {
      placeMap.set(p.culName, {
        type: "place",
        id: p.seq,
        name: p.culName,
      });
    });

    artworkPlaceFiltered.forEach((a) => {
      if (!placeMap.has(a.place)) {
        placeMap.set(a.place, {
          type: "artwork",
          id: a.seq,
          name: a.place,
        });
      }
    });

    return [
      ...Array.from(placeMap.values()),
      ...artworkFiltered.map((a) => ({
        type: "artwork",
        id: a.seq,
        name: a.title,
      })),
    ];
  }, [keyword, places, artworks]);

  return { results, loading };
}
