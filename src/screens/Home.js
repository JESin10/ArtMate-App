import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useContext } from "react";
import ArtworkInfoModal from "../components/modals/ArtworkInfoModal";
import BackwardIcon from "../assets/icons/backward.svg";
import ForwardIcon from "../assets/icons/forward.svg";
import Mainlogo from "../assets/icons/logo-main.svg";
import PlaceIcon from "../assets/icons/Menubar_gallery.svg";
import { AuthContext } from "../store/context";
import { XMLParser } from "fast-xml-parser";
import SearchBar from "../components/search/SearchBar";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
  increment,
  serverTimestamp,
  Timestamp,
  where,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function Home({ navigation }) {
  const { user } = useContext(AuthContext);
  const [artworks, setArtworks] = useState([]); // 작품들 전체
  const [recentArtworks, setRecentArtworks] = useState([]); // 금주의 최신작품
  const [recentPage, setRecentPage] = useState(0);
  const [endedArtworks, setEndedArtworks] = useState([]); // 종료예정 작품
  const [detailArtwork, setDetailArtwork] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [recommendedArtworks, setRecommendedArtworks] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [followerMap, setFollowerMap] = useState({});
  const CARD_WIDTH = 310;
  const ITEM_SPACING = 12;
  const ITEM_SIZE = CARD_WIDTH + ITEM_SPACING;
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const RECENT_PER_PAGE = 4;
  const RECENT_TOTAL_ITEMS = 16; // 총 슬롯 수 (항상 16개로 맞춤)
  const recentTotalPages = Math.max(
    1,
    Math.ceil(RECENT_TOTAL_ITEMS / RECENT_PER_PAGE),
  );
  const parser = new XMLParser({
    ignoreAttributes: false,
  });
  const now = Timestamp.now();
  const expireAt = Timestamp.fromMillis(
    now.toMillis() + 7 * 24 * 60 * 60 * 1000,
  );

  // useEffect 수정
  useEffect(() => {
    if (selectedArtwork?.seq) {
      getArtwork();
      getDetailArtwork(selectedArtwork.seq);
    } else {
      getArtwork();
    }
  }, [selectedArtwork]);

  // 팔로우 여부 실시간 구독
  useEffect(() => {
    if (!user) return;

    const followingRef = collection(db, "users", user.uid, "following");
    const followerRef = collection(db, "users", user.uid, "followers");

    const followingUnsubscribe = onSnapshot(followingRef, (snapshot) => {
      const following = {};
      snapshot.docs.forEach((doc) => {
        following[doc.id] = true; // 팔로우 상태
      });
      setFollowingMap(following);
    });
    const followerUnsubscribe = onSnapshot(followerRef, (snapshot) => {
      const follower = {};
      snapshot.docs.forEach((doc) => {
        follower[doc.id] = true; // 팔로우 상태
      });
      setFollowerMap(follower);
    });

    return () => {
      followerUnsubscribe();
      followingUnsubscribe();
    };
  }, [user]);

  // 자동 슬라이드 (5초)
  useEffect(() => {
    if (!recommendedArtworks || recommendedArtworks.length === 0) return;

    const id = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % recommendedArtworks.length;

        if (flatListRef.current && recommendedArtworks.length > 0) {
          flatListRef.current.scrollToIndex({
            index: next,
            animated: true,
            viewPosition: 0.5,
          });
        }

        return next;
      });
    }, 5000);

    return () => clearInterval(id);
  }, [recommendedArtworks]);

  //최근전시불러오기
  useEffect(() => {
    if (recentPage >= recentTotalPages) setRecentPage(0);
  }, [recentArtworks, recentTotalPages]);

  //추천게정불러오기
  useEffect(() => {
    getRecommendedUsers();
  }, []);

  //작품 랜덤 추천
  useEffect(() => {
    if (!artworks || artworks.length === 0) {
      setRecommendedArtworks([]);
      return;
    }

    const today = new Date();
    // 종료 안 된 전시만
    const activeArtworks = artworks?.filter((item) => {
      const end = parseDateSafe(item.endDate);
      return end && end >= today;
    });
    // 썸네일 있는 전시만
    const withThumbnail = activeArtworks.filter(
      (item) => item.thumbnail && item.thumbnail.startsWith("http"),
    );
    // 랜덤 5개 추출
    const randomFive = getRandomItems(withThumbnail, 5);
    setRecommendedArtworks(randomFive);
  }, [artworks]);

  // artworks가 바뀔 때마다 recent/ended 계산
  useEffect(() => {
    if (!artworks || artworks.length === 0) {
      setRecentArtworks([]);
      setEndedArtworks([]);
      return;
    } else {
      setRecentArtworks(computeRecentArtworks(artworks));
      // computeRecentArtworks(artworks);
      setEndedArtworks(computeEndedArtworks(artworks));
    }
  }, [artworks]);

  //간단 작품 정보
  const getArtwork = async () => {
    setLoading(true);

    try {
      const url = `${process.env.REACT_APP_SERVER_URL}/area2?serviceKey=${
        process.env.REACT_APP_API_KEY
      }&PageNo=${parseInt(1)}&numOfrows=${parseInt(30)}`;

      const response = await fetch(url);
      const xmlText = await response.text();

      const jsonData = parser.parse(xmlText);

      const rawItems = jsonData?.response?.body?.items?.item || [];
      const list = Array.isArray(rawItems) ? rawItems : [rawItems];
      // console.log(list);
      const normalized = list.map((item) => ({
        seq: item.seq,
        title: item?.title,
        startDate: item?.startDate,
        endDate: item?.endDate,
        place: item?.place,
        area: item?.area,
        sigungu: item?.sigungu,
        thumbnail: item?.thumbnail?.startsWith("http:")
          ? item.thumbnail.replace("http:", "https:")
          : item?.thumbnail,
        gpsX: item?.gpsX,
        gpsY: item?.gpsY,
      }));

      setArtworks(normalized);
    } catch (error) {
      console.error("홈화면 작품 불러오기 오류:", error);
      setArtworks([]);
    }
    setLoading(false);
  };

  //상세 작품정보
  const getDetailArtwork = async (seq) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/detail2?serviceKey=${process.env.REACT_APP_API_KEY}&seq=${seq}`,
      );

      if (!response.ok) {
        console.error(
          `getDetailArtwork: API 호출 실패 (상태 코드: ${response.status})`,
        );
        setDetailArtwork([]);
        return;
      }

      const xmlText = await response.text();

      if (!xmlText || xmlText.trim().length === 0) {
        console.error("getDetailArtwork: 응답이 비어 있습니다.");
        setDetailArtwork([]);
        return;
      }

      const jsonData = parser.parse(xmlText);

      const detail = jsonData?.response?.body?.items?.item || null;

      if (!detail) {
        console.warn("getDetailArtwork: detail 데이터가 없습니다.");
      }

      setDetailArtwork(detail);
    } catch (error) {
      console.error("getDetailArtwork: API 호출 오류:", error);
      setDetailArtwork([]);
    }
  };

  const handleModalOpen = (seq) => {
    if (!seq) return;
    getDetailArtwork(seq);
    setShowModal(true);
  };

  const data = artworks?.slice(0, 4); // 슬라이드에 사용할 데이터

  // ViewableItems 변경시 인덱스 동기화
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setCurrentIndex(idx);
    }
  });

  // dot 클릭 시 이동
  const goToIndex = (index) => {
    if (!flatListRef.current || recommendedArtworks.length === 0) return;

    flatListRef.current.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });

    setCurrentIndex(index);
  };

  // 날짜 문자열을 안전하게 Date로 파싱 (YYYY-MM-DD 같은 형태 예상)
  const parseDateSafe = (dateStr) => {
    if (!dateStr) return null;

    const s = String(dateStr).trim();

    // 20281231 같은 숫자형 날짜 처리
    if (/^\d{8}$/.test(s)) {
      const year = s.slice(0, 4);
      const month = s.slice(4, 6);
      const day = s.slice(6, 8);
      return new Date(`${year}-${month}-${day}`);
    }

    // 일반 날짜 처리
    const normalized = s.replace(/\./g, "-").slice(0, 10);
    const d = new Date(normalized);

    return isNaN(d.getTime()) ? null : d;
  };

  // 날짜 문자열을 'YYYY년 M월 D일' 형식으로 변환
  const Dateformat = (dateStr) => {
    if (dateStr == null) return "";
    const s = String(dateStr).trim();

    // 'YYYYMMDD' 형태
    if (/^\d{8}$/.test(s)) {
      const year = s.slice(0, 4);
      const month = String(parseInt(s.slice(4, 6), 10));
      const day = String(parseInt(s.slice(6, 8), 10));
      return `${year}년 ${month}월 ${day}일`;
    }

    return String(dateStr) ?? "";
  };

  //랜덤 추천
  const getRandomItems = (array, count) => {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  };

  // artworks 배열을 받아 DP_START 기준으로 현재 날짜와 가까운 순으로 정렬하여 설정
  const computeRecentArtworks = (artworks) => {
    const today = new Date(); // 현재 날짜

    return artworks
      .map((artwork) => {
        const start = parseDateSafe(artwork.startDate) || today; // startDate를 Date 객체로 변환
        return { ...artwork, start }; // 변환된 startDate를 추가
      })
      .sort((a, b) => {
        const aDiff = Math.abs(a.start.getTime() - today.getTime()); // 오늘과의 차이 계산 (타임스탬프 사용)
        const bDiff = Math.abs(b.start.getTime() - today.getTime());
        return aDiff - bDiff; // 차이가 작은 순으로 정렬
      });
  };

  // artworks 배열을 받아 DP_END 기준으로 현재 날짜와 가까운 순으로 정렬하여 설정
  const computeEndedArtworks = (items) => {
    const today = new Date();
    const mapped = items
      .map((it) => ({
        raw: it,
        end: parseDateSafe(it.endDate) || today, // 기본값으로 오늘 날짜 설정
      }))
      .filter((x) => x.end !== null); // 종료일 없는 항목은 제외 (필요시 포함)

    mapped.sort((a, b) => {
      const aFuture = a.end >= today;
      const bFuture = b.end >= today;
      if (aFuture !== bFuture) return aFuture ? -1 : 1; // 곧 종료되는(미래 종료) 항목 우선
      const aDiff = Math.abs(a.end - today);
      const bDiff = Math.abs(b.end - today);
      return aDiff - bDiff;
    });

    return mapped.map((m) => m.raw);
  };

  const filledRecent = (() => {
    if (!recentArtworks || recentArtworks.length === 0) {
      console.warn("recentArtworks가 비어 있습니다. 기본값을 채웁니다.");
      return Array(RECENT_TOTAL_ITEMS).fill(null); // 기본값으로 null 채우기
    }

    const arr = recentArtworks.slice(0, RECENT_TOTAL_ITEMS);
    while (arr.length < RECENT_TOTAL_ITEMS) arr.push(null);
    return arr;
  })();

  // place로 묶기
  const groupByPlace = (items) => {
    return items.reduce((acc, item) => {
      const key = item.place;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  };
  const placeGroups = groupByPlace(artworks);

  const getMyFollowing = async () => {
    if (!user?.uid) return []; // 안전 체크

    const snapshot = await getDocs(
      collection(db, "users", user?.uid, "following"),
    );

    const followingIds = [];

    snapshot.forEach((doc) => {
      followingIds.push(doc.id);
    });

    return followingIds;
  };

  //유저 랜덤 추천
  const getRecommendedUsers = async () => {
    try {
      const myFollowing = (await getMyFollowing()) || [];
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = [];

      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // 현재 로그인 유저 제외
      const filtered = users.filter((u) => u.id !== user?.uid);

      // 랜덤 섞기
      const shuffled = filtered.sort(() => 0.5 - Math.random());

      // 5명 추천
      const randomUsers = shuffled.slice(0, 5);

      //팔로우 여부
      const usersWithFollowState = randomUsers.map((u) => ({
        ...u,
        isFollowing: myFollowing.includes(u.id),
      }));
      setRecommendedUsers(usersWithFollowState);
    } catch (error) {
      console.error("추천 유저 불러오기 오류:", error);
    }
  };

  // 팔로우, 언팔로우
  const FollowUser = async (targetUser) => {
    if (!user) {
      Alert.alert("로그인이 필요합니다.");
      return;
    }

    const targetUserId = targetUser.id;
    const followingRef = doc(db, "users", user.uid, "following", targetUserId);
    const followerRef = doc(db, "users", targetUserId, "followers", user.uid);

    try {
      if (followingMap[targetUserId]) {
        // 언팔로우
        await deleteDoc(followingRef);
        await deleteDoc(followerRef);
        await updateDoc(doc(db, "users", user.uid), {
          followingCnt: increment(-1),
        });
        await updateDoc(doc(db, "users", targetUserId), {
          followerCnt: increment(-1),
        });
        await deleteFollowNotification(targetUserId);
      } else {
        // 팔로우
        await setDoc(followingRef, {
          displayName: targetUser.displayName,
          photoURL: targetUser.photoURL || null,
          createdAt: serverTimestamp(),
        });

        await setDoc(followerRef, {
          displayName: user.displayName,
          photoURL: user.photoURL || null,
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "users", user.uid), {
          followingCnt: increment(1),
        });

        await updateDoc(doc(db, "users", targetUserId), {
          followerCnt: increment(1),
        });
        //상대에게 팔로우 알림
        if (user.uid !== targetUserId) {
          await addDoc(collection(db, "users", targetUserId, "notifications"), {
            type: "follow",
            fromUserId: user.uid,
            fromUserName: user.displayName,
            fromUserPhoto: user.photoURL,
            createdAt: serverTimestamp(),
            expireAt: expireAt,
            isRead: false,
          });
        }
      }
    } catch (error) {
      console.error("팔로우 토글 실패:", error);
      Alert.alert("팔로우/언팔로우 실패. 다시 시도해주세요.");
    }
  };

  //언팔로우시 알림 삭제
  const deleteFollowNotification = async (targetUserId) => {
    const q = query(
      collection(db, "users", targetUserId, "notifications"),
      where("type", "==", "follow"),
      where("fromUserId", "==", user.uid),
    );

    const snapshot = await getDocs(q);

    snapshot.forEach(async (docSnap) => {
      await deleteDoc(docSnap.ref);
    });
  };

  return (
    <SafeAreaView
      style={{
        width: "95%",
        marginHorizontal: "auto",
        flexDirection: "column",
        flex: 1,
        position: "relative", // overlay를 위해 상대 위치 필요
      }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* <TouchableOpacity style={styles.container}> */}
        <View style={styles.container}>
          <TouchableOpacity style={{ alignItems: "center" }}>
            <Mainlogo width={150} height={50} />
          </TouchableOpacity>
          <SearchBar />
          <View style={styles.recommandContainer}>
            <View style={styles.subTitle}>
              {user ? (
                <>
                  <Text style={styles.pageTitle}>
                    {user?.displayName}님의 취향저격 전시모음
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.pageTitle}>당신을 위한 추천 전시</Text>
                </>
              )}
              <View style={styles.recommandFactor}>
                <FlatList
                  ref={flatListRef}
                  data={recommendedArtworks}
                  horizontal
                  pagingEnabled={false}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => String(item.DP_SEQ ?? index)}
                  contentContainerStyle={styles.recommandList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.recommandCard}
                      activeOpacity={0.8}
                      onPress={() => {
                        setSelectedArtwork(item);
                        handleModalOpen(item?.seq);
                      }}
                    >
                      <ImageBackground
                        source={{ uri: item.thumbnail }}
                        style={styles.recommandImage}
                        imageStyle={styles.MainbackgroundImage}
                        resizeMethod="cover"
                      />
                      <View
                        style={{
                          flexDirection: "column",
                          backgroundColor: "#608D00",
                          padding: 8,
                          borderBottomLeftRadius: 10,
                          borderBottomRightRadius: 10,
                        }}
                      >
                        <Text numberOfLines={1} style={styles.recommandPart}>
                          {item.place}
                        </Text>
                        <Text numberOfLines={1} style={styles.recommandTitle}>
                          {item.title}
                        </Text>
                        {/* <Text numberOfLines={3} style={styles.DescStyle}>
                          {htmlToPlain(item.DP_INFO)}
                        </Text> */}
                        <Text style={styles.DescStyle}>
                          {Dateformat(item.startDate)} ~
                          {Dateformat(item.endDate)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  onViewableItemsChanged={onViewableItemsChanged.current}
                  viewabilityConfig={viewConfigRef.current}
                  getItemLayout={(d, index) => ({
                    length: ITEM_SIZE,
                    offset: ITEM_SIZE * index,
                    index,
                  })}
                />
              </View>

              <View style={styles.dotsContainer}>
                {recommendedArtworks?.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => goToIndex(idx)}
                    style={[
                      styles.dot,
                      currentIndex === idx && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
          <View style={styles.recentContainer}>
            <View style={styles.subTitle}>
              <Text style={styles.pageTitle}>금주의 최신 전시모음</Text>
            </View>
            <View style={styles.recentContents}>
              {filledRecent
                .slice(
                  recentPage * RECENT_PER_PAGE,
                  recentPage * RECENT_PER_PAGE + RECENT_PER_PAGE,
                )
                .map((artwork, index) => {
                  const recentNum = index % 4;
                  const ImgStyle =
                    recentNum === 0
                      ? styles.recentImagesS
                      : recentNum === 1
                        ? styles.recentImagesL
                        : recentNum === 2
                          ? styles.recentImagesL
                          : styles.recentImagesS;

                  if (artwork) {
                    return (
                      <TouchableOpacity
                        key={artwork.seq ?? index}
                        style={ImgStyle}
                        onPress={() => {
                          setSelectedArtwork(artwork);
                          handleModalOpen(artwork?.seq);
                        }}
                      >
                        <ImageBackground
                          source={{ uri: artwork.thumbnail }}
                          style={styles.imageBackground}
                          imageStyle={styles.backgroundImage}
                        />
                      </TouchableOpacity>
                    );
                  }

                  // Placeholder: green empty tile when no artwork
                  return (
                    <View
                      key={"empty-" + index}
                      style={[ImgStyle, styles.recentPlaceholder]}
                    />
                  );
                })}
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => setRecentPage((p) => Math.max(0, p - 1))}
                disabled={recentPage === 0}
                style={[
                  styles.iconButton,
                  recentPage === 0 && styles.disabledIcon,
                ]}
              >
                <BackwardIcon width={24} height={24} fill="#000" />
              </TouchableOpacity>

              <Text style={{ alignSelf: "center", marginHorizontal: 12 }}>
                {recentPage + 1} / {recentTotalPages}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setRecentPage((p) => Math.min(recentTotalPages - 1, p + 1))
                }
                disabled={recentPage >= recentTotalPages - 1}
                style={[
                  styles.iconButton,
                  recentPage >= recentTotalPages - 1 && styles.disabledIcon,
                ]}
              >
                <ForwardIcon width={24} height={24} fill="#000" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.userRecommendContainer}>
            <View style={styles.subTitle}>
              <Text style={styles.pageTitle}>추천 계정</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recommendedUsers.map((u, index) => (
                <View key={u.id} style={styles.userCard}>
                  <TouchableOpacity
                    style={styles.userAvatar}
                    onPress={() => {
                      navigation.navigate("Review", {
                        screen: "ReviewMain",
                      });

                      setTimeout(() => {
                        navigation.navigate("Review", {
                          screen: "Profile",
                          params: { userId: u.uid },
                        });
                      }, 0);
                    }}
                  >
                    {u.photoURL && (
                      <Image
                        source={{ uri: u.photoURL }}
                        style={{ width: 60, height: 60, borderRadius: 30 }}
                      />
                    )}
                  </TouchableOpacity>

                  <Text style={styles.userName}>{u.displayName}</Text>

                  {u.bio && (
                    <Text numberOfLines={1} style={styles.userDesc}>
                      {u.bio}
                    </Text>
                  )}

                  {!user ? (
                    <View style={{ height: 20, marginTop: 10 }}>
                      <Text style={{ color: "black", fontSize: 12 }}>
                        팔로워 {u.followerCnt}명
                      </Text>
                    </View>
                  ) : followingMap[u.id] ? (
                    <View style={{ height: 20, marginTop: 10 }}>
                      <Text style={{ color: "black", fontSize: 12 }}>
                        팔로워 {u.followerCnt + 1}명 {/* 실시간 반영용 */}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.followBtn}
                      onPress={async () => {
                        await FollowUser(u);
                        // 선택적으로 로컬 UI 반영
                        setRecommendedUsers((prev) =>
                          prev.map((userItem) =>
                            userItem.id === u.id
                              ? {
                                  ...userItem,
                                  followerCnt: userItem.followerCnt + 1,
                                }
                              : userItem,
                          ),
                        );
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 12 }}>
                        팔로우
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
          <View style={styles.endedContainer}>
            <View style={styles.subTitle}>
              <Text style={styles.pageTitle}>종료예정 전시모음</Text>
              {endedArtworks.slice(0, 3).map((endedartwork, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.endedContentsContainer}
                    onPress={() => {
                      setSelectedArtwork(endedartwork);
                      handleModalOpen(endedartwork?.seq);
                    }}
                  >
                    <ImageBackground
                      source={{ uri: endedartwork.thumbnail }}
                      style={styles.endedImages}
                      imageStyle={styles.backgroundImage}
                    />
                    <View style={styles.endedContents}>
                      <Text
                        style={{
                          color: "gray",
                          marginBottom: 5,
                          fontSize: 10,
                        }}
                      >
                        {Dateformat(endedartwork?.endDate)}까지 만날 수 있는
                        전시!
                      </Text>
                      <Text style={styles.endedNamecStyle} numberOfLines={3}>
                        {endedartwork.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ArtworkInfoModal
              visible={showModal}
              onClose={() => {
                setShowModal(false);
                setDetailArtwork([]);
                setSelectedArtwork(null);
              }}
              artwork={detailArtwork}
              seq={selectedArtwork?.seq}
            />
          </View>
          <View style={styles.artInPlaceContainer}>
            <View style={styles.subTitle}>
              <Text style={styles.pageTitle}>전시장별 전시모음</Text>
            </View>
            <View style={styles.artInPlaceContents}>
              {Object.entries(placeGroups)
                .slice(0, 5)
                .map(([place, items]) => (
                  <View key={place} style={{ flexDirection: "column" }}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <PlaceIcon width={24} height={24} fill="#608D00" />
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 14,
                          marginVertical: 10,
                          marginHorizontal: 4,
                        }}
                      >
                        {place}
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        {items.slice(0, 10).map((item, index) => (
                          <TouchableOpacity
                            key={`${item.seq}-${index}`}
                            style={{
                              marginRight: 10,
                              marginBottom: 22,
                              marginTop: 8,
                            }}
                            onPress={() => {
                              setSelectedArtwork(item);
                              handleModalOpen(item?.seq);
                            }}
                          >
                            {/* <ImageBackground
                              source={{ uri: item.thumbnail }}
                              style={styles.artInbackgroundImage}
                              imageStyle={styles.artInimageBackground}
                              resizeMode="cover"
                            /> */}
                            <View
                              style={{
                                backgroundColor: "#608D00",
                                borderWidth: 1,
                                borderRadius: 12,
                                borderColor: "#608D00",
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 14,
                                  marginVertical: 4,
                                  color: "white",
                                }}
                              >
                                {item.title}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    justifyContent: "center",
    padding: 10,
  },
  pageTitle: {
    fontSize: 22,
    color: "black",
    fontWeight: "bold",
    paddingLeft: 10,
    paddingVertical: 10,
  },
  searchbar: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    padding: 10,
    marginVertical: 15,
    marginHorizontal: "auto",
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  subTitle: {
    fontSize: 22,
    fontWeight: "semibold",
    alignItems: "flex-start",
    width: "100%",
    paddingVertical: 10,
    paddingLeft: 10,
  },

  DescStyle: {
    fontSize: 10,
    color: "#fff",
    marginVertical: 4,
  },
  MainbackgroundImage: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  backgroundImage: {
    borderRadius: 10,
  },
  artistImages: {
    width: "100%",
    height: 100,
    borderColor: "black",
    borderWidth: 1,
  },
  recommandFactor: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  recommandContainer: {
    width: "100%",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    height: "auto",
    // padding: 20,
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  recommandList: {
    paddingVertical: 8,
  },
  recommandCard: {
    width: 310,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: "transparent",
    padding: 10,
    overflow: "hidden",
  },
  recommandImage: {
    width: "100%",
    height: 450,
    borderRadius: 8,
  },
  recommandPart: {
    fontSize: 12,
    color: "gray",
    color: "#fff",
  },
  recommandTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#fff",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    width: "100%",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 6,
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#333",
  },
  recentContainer: {
    width: "100%",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
    height: "auto",
    // padding: 20,
    marginBottom: 10,
  },
  recentContents: {
    width: "95%",
    height: "auto",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "spce-between",
  },
  recentImagesS: {
    width: "50%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "white",
    margin: 5,
  },
  recentImagesL: {
    width: "40%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderRadius: 10,
    backgroundColor: "white",
  },
  recentPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 10,
    borderColor: "transparent",
    borderWidth: 1,
  },
  iconButton: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#5f5f5fff",
    borderWidth: 1,
    borderRadius: 20,
  },
  disabledIcon: {
    opacity: 0.35,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: "10",
    paddingRight: "10",
    marginTop: 10,
  },
  imageBackground: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  endedImages: {
    width: 130,
    height: 90,
  },
  endedContentsContainer: {
    width: "95%",
    alignItems: "center",
    flexDirection: "row",
    height: "auto",
    display: "flex",
    marginVertical: 10,
    justifyContent: "center",
  },
  endedContents: {
    width: "55%",
    flexDirection: "column",
    height: "auto",
    display: "flex",
    marginVertical: 5,
    marginLeft: 5,
  },
  endedNamecStyle: {
    marginVertical: 2,
    width: "50%",
    color: "#000",
    fontSize: "13",
    flexWrap: "wrap",
    display: "flex",
    width: "auto",
    fontWeight: "bold",
  },
  endedContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    height: "auto",
    // padding: 20,
    marginBottom: 10,
  },

  artInPlaceContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: "#D9D9D9",
    height: "auto",
  },
  artInPlaceContents: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 20,

    // backgroundColor: "pink",
  },
  artInimageBackground: {
    width: "100%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 10,
  },
  artInbackgroundImage: {
    borderRadius: 10,
    width: 100,
    height: 120,
    marginVertical: 10,
  },
  userRecommendContainer: {
    width: "100%",
    marginBottom: 20,
  },

  userCard: {
    width: 110,
    marginRight: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ddd",
    marginBottom: 6,
    overflow: "hidden",
  },

  userName: {
    fontWeight: "bold",
    fontSize: 12,
  },

  userDesc: {
    fontSize: 10,
    color: "gray",
    marginBottom: 6,
  },
  followBtn: {
    backgroundColor: "#608D00",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 10,
    height: 20,
  },
});
