import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { Alert } from "react-native";
import { db } from "../../firebase";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
  tokenEndpoint: "https://kauth.kakao.com/oauth/token",
};

export const useKakaoLogin = ({ setUser, navigation }) => {
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
    projectNameForProxy: "jes_10/artmate-app",
  });
  // const redirectUri = "https://auth.expo.dev/jes_10/artmate-app";

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: `${process.env.REACT_APP_KAKAO_CLIENTID}`,
      redirectUri,
      responseType: "code",
    },
    discovery,
  );

  useEffect(() => {
    const fetchKakaoUser = async () => {
      if (response?.type !== "success") return;

      try {
        const code = response.params.code;

        // 1️⃣ access token 요청
        const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
          method: "POST",
          headers: {
            "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
          },
          body: `grant_type=authorization_code&client_id=${process.env.REACT_APP_KAKAO_CLIENTID}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`,
        });

        const tokenJson = await tokenRes.json();
        const accessToken = tokenJson.access_token;

        // 2️⃣ 사용자 정보 요청
        const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const kakaoUser = await userRes.json();

        // 3️⃣ 데이터 가공
        const uid = "kakao_" + kakaoUser.id;
        const email = kakaoUser.kakao_account?.email || null;
        const name = kakaoUser.kakao_account?.profile?.nickname || "카카오유저";
        const photoURL =
          kakaoUser.kakao_account?.profile?.profile_image_url || null;

        // 4️⃣ Firestore 저장
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid,
            email,
            displayName: name,
            photoURL,
            followerCnt: 0,
            followingCnt: 0,
            createdAt: new Date().toUTCString(),
            provider: "kakao",
          });
        }

        // 5️⃣ 상태 저장
        setUser({
          uid,
          email,
          displayName: name,
          photoURL,
        });

        navigation.navigate("Bottom", { screen: "Home" });
      } catch (error) {
        console.log(error);
        Alert.alert("오류", "카카오 로그인 실패");
      }
    };

    fetchKakaoUser();
  }, [response]);

  return {
    promptAsync,
    request,
  };
};
