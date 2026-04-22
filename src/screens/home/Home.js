import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import {
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../firebase";
import BackwardIcon from "../../assets/icons/backward.svg";
import ForwardIcon from "../../assets/icons/forward.svg";
import Mainlogo from "../../assets/icons/logo-main.svg";
import PlaceIcon from "../../assets/icons/Menubar_gallery.svg";
import ArtworkCard from "../../components/artwork/ArtworkCard";
import RecentArtworkCard from "../../components/artwork/RecentArtworkCard";
import SectionTitle from "../../components/common/SectionTitle";
import ArtworkInfoModal from "../../components/modals/ArtworkInfoModal";
import SearchBar from "../../components/search/SearchBar";
import UserCard from "../../components/users/UserCard";
import useRecentArtworks from "../../hooks/useRecentArtworks";
import useRecommendArtworks from "../../hooks/useRecommendArtworks";
import { fetchArtwork } from "../../services/artService";
import { getRecommendedUsers } from "../../services/userService";
import { AuthContext } from "../../store/context";
import { useArtStore } from "../../store/useArtStore";
import { useUserStore } from "../../store/useUserStore";
import { colors } from "../../styles/colors";
import { computeEndedArtworks, groupByPlace } from "../../utils/artwork";
import { formatDate, parseDateSafe } from "../../utils/date";
import { parseItems } from "../../utils/xmlParser";

export default function Home({ navigation }) {
  const { user } = useContext(AuthContext);
  const { artworks, setArtworks, setDetailArtwork, setLoading } = useArtStore();

  const { followingMap, setFollowingMap, setFollowerMap } = useUserStore();
  const {
    recentPage,
    setRecentPage,
    setRecentArtworks,
    filledRecent,
    recentTotalPages,
    RECENT_PER_PAGE,
  } = useRecentArtworks(artworks, parseDateSafe);
  const {
    recommendedArtworks,
    currentIndex,
    setCurrentIndex,
    flatListRef,
    goToIndex,
  } = useRecommendArtworks(artworks, parseDateSafe);

  const [endedArtworks, setEndedArtworks] = useState([]); // 종료예정 작품
  const [showModal, setShowModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const CARD_WIDTH = 310;
  const ITEM_SPACING = 12;
  const ITEM_SIZE = CARD_WIDTH + ITEM_SPACING;
  const expireAt = Timestamp.fromMillis(
    Timestamp.now().toMillis() + 7 * 24 * 60 * 60 * 1000,
  );

  useEffect(() => {
    getArtwork();
  }, []);

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

  //추천게정불러오기
  useEffect(() => {
    const loadUsers = async () => {
      const users = await getRecommendedUsers(user?.uid);
      setRecommendedUsers(users);
    };

    loadUsers();
  }, [user]);

  // artworks가 바뀔 때마다 recent/ended 계산
  useEffect(() => {
    if (!artworks || artworks.length === 0) {
      setEndedArtworks([]);
      return;
    }

    setEndedArtworks(computeEndedArtworks(artworks));
  }, [artworks]);

  //간단 작품 정보
  const getArtwork = async () => {
    setLoading(true);

    try {
      const xmlText = await fetchArtwork(1, 30);
      const jsonData = parseItems(xmlText);
      const list = Array.isArray(jsonData) ? jsonData : [jsonData];
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

  // ViewableItems 변경시 인덱스 동기화
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setCurrentIndex(idx);
    }
  });

  // 오픈모달
  const openArtwork = (item) => {
    if (!item) return;

    setSelectedArtwork(item);
    setShowModal(true);
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
          <View style={styles.recommendContainer}>
            <View>
              {user ? (
                <>
                  <Text style={styles.pageTitle}>
                    {user?.displayName}님의 취향저격 전시모음
                  </Text>
                </>
              ) : (
                <>
                  <SectionTitle title="당신을 위한 추천 전시" />
                </>
              )}
              <View style={styles.recommendFactor}>
                <FlatList
                  ref={flatListRef}
                  data={recommendedArtworks}
                  horizontal
                  pagingEnabled={false}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.seq}
                  contentContainerStyle={styles.recommendList}
                  renderItem={({ item }) => (
                    <ArtworkCard item={item} openArtwork={openArtwork} />
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
            <SectionTitle title="금주의 최신 전시모음" />
            <View style={styles.recentContents}>
              {filledRecent
                .slice(
                  recentPage * RECENT_PER_PAGE,
                  recentPage * RECENT_PER_PAGE + RECENT_PER_PAGE,
                )
                .map((artwork, index) => {
                  const variant =
                    index % 4 === 0 || index % 4 === 3 ? "S" : "L";

                  return (
                    <RecentArtworkCard
                      key={artwork?.seq ?? index}
                      artwork={artwork}
                      variant={variant}
                      onPress={() => openArtwork(artwork)}
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
          <SectionTitle title="추천 계정" />
          <View style={styles.userRecommendContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recommendedUsers.map((u, index) => (
                <UserCard
                  key={u.id}
                  u={u}
                  user={user}
                  followingMap={followingMap}
                  expireAt={expireAt}
                  navigation={navigation}
                />
              ))}
            </ScrollView>
          </View>
          <View style={styles.endedContainer}>
            {/* <View style={styles.subTitle}> */}
            {/* <Text style={styles.pageTitle}>종료예정 전시모음</Text> */}
            <SectionTitle title="종료예정 전시모음" />
            {endedArtworks.slice(0, 3).map((endedartwork, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.endedContentsContainer}
                  onPress={() => {
                    openArtwork(endedartwork);
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
                      {formatDate(endedartwork?.endDate)}까지 만날 수 있는 전시!
                    </Text>
                    <Text style={styles.endedNamecStyle} numberOfLines={3}>
                      {endedartwork.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {/* </View> */}

            <ArtworkInfoModal
              visible={showModal}
              onClose={() => {
                setShowModal(false);
                setDetailArtwork(null);
                setSelectedArtwork(null);
              }}
              selectedArtwork={selectedArtwork}
              seq={selectedArtwork?.seq}
            />
          </View>
          <View style={styles.artInPlaceContainer}>
            {/* <View style={styles.subTitle}>
              <Text style={styles.pageTitle}>전시장별 전시모음</Text>
            </View> */}
            <SectionTitle title="전시장별 전시모음" />
            <View style={styles.artInPlaceContents}>
              {Object.entries(groupByPlace(artworks))
                .slice(0, 5)
                .map(([place, items]) => (
                  <View key={place} style={{ flexDirection: "column" }}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <PlaceIcon width={24} height={24} fill={colors.primary} />
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
                              openArtwork(item);
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
                                backgroundColor: colors.primary,
                                borderWidth: 1,
                                borderRadius: 12,
                                borderColor: colors.primary,
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
    borderColor: colors.black,
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    padding: 10,
    marginVertical: 15,
    marginHorizontal: "auto",
    backgroundColor: colors.white,
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
  backgroundImage: {
    borderRadius: 10,
  },
  artistImages: {
    width: "100%",
    height: 100,
    borderColor: colors.black,
    borderWidth: 1,
  },
  recommendFactor: {
    width: "100%",
    shadowColor: colors.black,
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  recommendContainer: {
    width: "100%",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    height: "auto",
    // padding: 20,
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  recommendList: {
    paddingVertical: 8,
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
    backgroundColor: colors.lightGray,
    marginHorizontal: 6,
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.black,
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
    justifyContent: "spce-between",
  },
  recentImagesS: {
    width: "50%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: colors.white,
    margin: 5,
  },
  recentImagesL: {
    width: "40%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderRadius: 10,
    backgroundColor: colors.white,
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
    borderColor: colors.gray,
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
    color: colors.black,
    fontSize: "13",
    flexWrap: "wrap",
    display: "flex",
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
    backgroundColor: colors.lightGray,
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
    width: "90%",
    marginBottom: 20,
    marginHorizontal: "auto",
  },

  userCard: {
    width: 110,
    marginRight: 12,
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightGray,
    marginBottom: 6,
    overflow: "hidden",
  },

  userName: {
    fontWeight: "bold",
    fontSize: 12,
  },

  userDesc: {
    fontSize: 10,
    color: colors.gray,
    marginBottom: 6,
  },
  followBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 10,
    height: 20,
  },
});
