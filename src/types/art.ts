import { Timestamp } from "firebase/firestore";

export interface ArtworkPayload {
  id: string;
  seq?: string;

  title: string;

  startDate?: string;
  endDate?: string;

  place?: string;
  area?: string;
  sigungu?: string;

  gpsX?: string;
  gpsY?: string;

  thumbnail?: string;

  serviceName?: string;
}

export interface ArtworkNormalized {
  seq: string;
  title: string;
  startDate?: string;
  endDate?: string;
  place?: string;
  area?: string;
  sigungu?: string;
  thumbnail?: string;
  gpsX?: string;
  gpsY?: string;
}

export interface SelectedArtwork {
  id: string;
  seq: string;
  title: string;
  createAt: Timestamp;
  imageUrl: string;
}

export interface EndedArtworks {
  id: string;
  seq: string;
  title: string;
  endDate: string;
  thumbnail: string;
}
