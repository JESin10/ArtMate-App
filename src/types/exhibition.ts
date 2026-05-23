export interface RawExhibitionItem {
  seq?: string | number;
  title?: string;

  startDate?: string;
  endDate?: string;

  gpsY?: string | number;
  gpsX?: string | number;

  place?: string;
  area?: string;
  sigungu?: string;

  thumbnail?: string;

  serviceName?: string;

  [key: string]: any;
}

export interface NormalizedPlace {
  id: string;

  title: string;

  period: {
    start?: string;
    end?: string;
  };

  location: {
    lat: number;
    lng: number;
    place?: string;
    area?: string;
    sigungu?: string;
  };

  thumbnail: string | null;

  raw: RawExhibitionItem;
}

export interface NormalizedArtwork {
  id: string;

  title: string;

  serviceName?: string;

  period: {
    start?: string;
    end?: string;
  };

  location: {
    area?: string;
  };

  thumbnail: string | null;

  raw: RawExhibitionItem;
}
