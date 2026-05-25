import { Timestamp } from "firebase/firestore";

export interface ArtworkPayload {
  id: string;
  seq: string;

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

  createdAt?: Timestamp;
}

export type ArtworkNormalized = ArtworkPayload;

export type SelectedArtwork = ArtworkPayload;

export type EndedArtwork = Pick<ArtworkPayload, "id" | "seq" | "title" | "endDate" | "thumbnail">;
