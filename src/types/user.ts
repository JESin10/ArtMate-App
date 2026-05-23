export interface AppUser {
  id: string;

  displayName?: string;
  photoURL?: string;
  email?: string;

  isFollowing?: boolean;
}