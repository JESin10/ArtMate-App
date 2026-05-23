import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

interface UserData {
  displayName?: string;
  photoURL?: string;
}

interface RecommendedUser extends UserData {
  id: string;
  isFollowing: boolean;
}

// 내가 팔로우한 유저 ID 리스트
export const getMyFollowingIds = async (userId:string): Promise<string[]> => {
  if (!userId) return [];

  const snapshot = await getDocs(collection(db, "users", userId, "following"));

  return snapshot.docs.map((doc) => doc.id);
};

// 추천 유저 가져오기 (기존 Home 로직 100% 반영)
export const getRecommendedUsers = async (userId:string): Promise<RecommendedUser[]> => { 
  try {
    const myFollowingIds = await getMyFollowingIds(userId);

    const querySnapshot = await getDocs(collection(db, "users"));

    const users: RecommendedUser[] = [];

    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...(doc.data() as UserData),
      });
    });

    // 1. 나 자신 제외
    const filtered = users.filter((u) => u.id !== userId);

    // 2. 랜덤 섞기
    const shuffled = filtered.sort(() => 0.5 - Math.random());

    // 3. 5명만
    const randomUsers = shuffled.slice(0, 5);

    // 4. isFollowing 추가
    const usersWithFollowState = randomUsers.map((u) => ({
      ...u,
      isFollowing: myFollowingIds.includes(u.id),
    }));

    return usersWithFollowState;
  } catch (error: any) {
    console.error("추천 유저 불러오기 오류:", error);
    return [];
  }
};
