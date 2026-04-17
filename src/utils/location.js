export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const sortByDistance = (places, location) => {
  if (!location) return places;

  return [...places]
    .map((place) => {
      if (!place.gpsX || !place.gpsY) {
        return { ...place, distance: Infinity };
      }

      return {
        ...place,
        distance: getDistance(
          location.lat,
          location.lng,
          Number(place.gpsY),
          Number(place.gpsX),
        ),
      };
    })
    .sort((a, b) => a.distance - b.distance);
};
