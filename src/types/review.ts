export interface Review {
  id: string;

  userId: string;
  seq: string;

  title: string;
  content: string;

  rating: number;

  images: string[];

  LikeCnt: number;
  CommentCnt: number;

  displayName?: string;
  photoURL?: string;

  visitedDate?: Date;
}
