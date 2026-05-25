import { FieldValue } from "firebase/firestore";

export interface AppUser {
  id: string;

  displayName?: string;
  photoURL?: string;
  email?: string;

  isFollowing?: boolean;
}

export interface CreateUserPayload {
  displayName: string;
  email: string;
  uid: string;
  createdAt: FieldValue;
  followingCnt: number;
  followerCnt: number;
  photoURL: string;
}

export interface LoginUser {
  uid: string;
  email: string;
  displayName: string;
  followerCnt: number;
  followingCnt: number;
  photoURL: string | null;
  createdAt: string;
}

export interface SelectedUserPayload {
  id: string;
  displayName: string;
  photoURL: string;
  email: string;
  followingCnt: number;
  isFollowing: boolean;
}

export interface RecommendUserPayload {
  id: string;
  displayName: string;
  photoURL: string;
  email: string;
  followingCnt: number;
}
