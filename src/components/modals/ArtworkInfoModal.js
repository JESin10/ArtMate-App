import {
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { decode } from "html-entities"; // 추가: HTML 엔티티 디코드
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../../firebase";
import FilledBookmarkIcon from "../../assets/icons/bookmark-filled.svg";
import BookmarkIcon from "../../assets/icons/bookmark.svg";
import InfoIcon from "../../assets/icons/info.svg";
import ShareIcon from "../../assets/icons/share.svg";
import Map from "../../screens/places/Map";
import { AuthContext } from "../../store/context";
import { useArtStore } from "../../store/useArtStore";
import { colors } from "../../styles/colors";
import { fontSize, spacing } from "../../styles/theme";
import ReviewImageSlider from "../Slider/ReviewImageSlider";

export default function ArtworkInfoModal({ visible, onClose, seq, artwork }) {
  const {
    detailArtwork,
    loading,
    reviews,
    getDetailArtwork,
    subscribeReviews,
  } = useArtStore();
  const [filled, setFilled] = useState(false);
  const { user } = useContext(AuthContext);

  //해당 작품에 대한 리뷰
  useEffect(() => {
    if (!seq) return;
    getDetailArtwork(seq);
    const unsubscribe = subscribeReviews(seq);
    return () => unsubscribe();
  }, [seq]);

  // 북마크 실시간 구독
  useEffect(() => {
    if (!visible || !user?.uid || !seq) return;

    const bookmarkRef = doc(db, "users", user.uid, "bookmarks", String(seq));

    const unsubscribe = onSnapshot(
      bookmarkRef,
      (snap) => {
        setFilled(snap.exists());
      },
      (error) => {
        console.error("북마크 구독 오류:", error);
        setFilled(false);
      },
    );

    return () => unsubscribe();
  }, [visible, user?.uid, seq]);

  //태그 텍스트 적용
  const htmlToPlain = (html) => {
    if (!html) return "";
    const plain = String(html)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<p[^>]*>/gi, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/<\/?[^>]+(>|$)/g, "") // 남은 모든 태그 제거
      .trim();
    return decode(plain);
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

    return String(dateStr)?.trim() || "";
  };

  //링크 열기
  const openLink = async (rawUrl) => {
    if (!rawUrl) {
      Alert.alert("알림", "유효한 링크가 없습니다.");
      return;
    }
    let url = String(rawUrl).trim();
    console.log("url:", url);

    if (!/^https?:\/\//i.test(url)) {
      url = `${url}`;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("오류", "이 링크를 열 수 없습니다.");
      }
    } catch (err) {
      console.error("openLink error", err);
      Alert.alert("오류", "링크를 열 수 없습니다.");
    }
  };

  //북마크 하기
  const BookmarkHandler = async () => {
    if (!user) {
      Alert.alert("알림", "로그인 후 이용가능합니다.");
      return;
    }

    if (!artwork?.seq) {
      console.warn("북마크할 작품 ID가 없습니다");
      return;
    }

    const uid = String(user.uid);
    const seqId = String(artwork.seq); // 여기서 안전하게 id 가져오기
    const img = (detailArtwork?.imgUrl ?? "").replace("http", "https");

    const bookmarkRef = doc(db, "users", uid, "bookmarks", seqId);
    const artworkRef = doc(db, "artworks", seqId);

    try {
      if (!filled) {
        // 북마크 추가
        await setDoc(bookmarkRef, {
          seq: seqId,
          artworkTitle: artwork.title ?? "",
          artworkImgUrl: img,
          createdAt: serverTimestamp(),
        });

        // 작품 컬렉션 count 증가 (merge: true → 문서 없으면 생성)
        await setDoc(
          artworkRef,
          {
            artworkTitle: artwork.title ?? "",
            artworkImgUrl: img,
            bookmarkCount: increment(1),
          },
          { merge: true },
        );

        setFilled(true);
        Alert.alert("안내", "북마크에 추가되었습니다.");
      } else {
        // 북마크 삭제
        await deleteDoc(bookmarkRef);
        await updateDoc(artworkRef, {
          bookmarkCount: increment(-1),
        });

        setFilled(false);
        Alert.alert("안내", "북마크에서 제거되었습니다.");
      }
    } catch (error) {
      console.error("BookmarkHandler error", error);
      Alert.alert("오류", "북마크 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {loading && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: "#fff", marginTop: 8 }}>로딩중...</Text>
          </View>
        </View>
      )}
      <View style={styles.modalBackdrop}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.ModalContainer}>
          <ScrollView
            contentContainerStyle={styles.ModalContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.imageContainer}>
              {detailArtwork?.imgUrl ? (
                <ImageBackground
                  source={{
                    uri: detailArtwork.imgUrl.replace("http", "https"),
                  }}
                  style={styles.imageBackground}
                  imageStyle={styles.image}
                  resizeMode="contain"
                />
              ) : (
                <Text title="NO IMAGE" />
              )}
            </View>
            <View style={styles.IconContainer}>
              <TouchableOpacity
                style={{ marginHorizontal: 12 }}
                onPress={() =>
                  Alert.alert("안내", "공유하기 기능은 곧 업데이트됩니다.")
                }
              >
                <ShareIcon width={24} height={24} />
              </TouchableOpacity>
              {filled ? (
                <TouchableOpacity onPress={() => BookmarkHandler()}>
                  <FilledBookmarkIcon
                    width={24}
                    height={24}
                    fill={colors.primary}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => BookmarkHandler()}>
                  <BookmarkIcon
                    width={24}
                    height={24}
                    style={{
                      color: "black",
                    }}
                    fill="#000"
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText1}>{detailArtwork?.title}</Text>
            </View>
            {/* <View style={styles.textContainer}>
              <Text style={styles.titleText2}>작가</Text>
              <Text style={styles.subText}>{artwork?.DP_ARTIST}</Text>
            </View> */}
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>전시기간</Text>
              <Text style={styles.subText}>
                {Dateformat(detailArtwork?.startDate)} ~{" "}
                {Dateformat(detailArtwork?.endDate)}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>전시장소</Text>
              <Text style={styles.subText}>{detailArtwork?.place}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>입장료</Text>
              {detailArtwork?.price ? (
                <Text style={styles.subText}> {detailArtwork?.price} </Text>
              ) : (
                <Text style={styles.subText}> 정보없음</Text>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>주소</Text>
              <Text style={styles.subText}>{detailArtwork?.placeAddr}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>홈페이지</Text>
              {detailArtwork?.url ? (
                <TouchableOpacity
                  style={styles.linkIcon}
                  onPress={() =>
                    Alert.alert(
                      "홈페이지로 이동",
                      "홈페이지로 이동하시겠습니까?",
                      [
                        { text: "취소", style: "cancel" },
                        {
                          text: "이동",
                          onPress: () => openLink(detailArtwork.url),
                        },
                      ],
                      { cancelable: true },
                    )
                  }
                >
                  <InfoIcon
                    width={20}
                    height={20}
                    fill="#000"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.subText}>홈페이지로 이동</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.subText}> 정보없음</Text>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>상세설명</Text>
              {detailArtwork?.contents1 ? (
                <Text style={styles.subText}>
                  {htmlToPlain(detailArtwork?.contents1)}
                </Text>
              ) : (
                <Text style={styles.subText}> 정보없음</Text>
              )}
            </View>
            <View style={styles.mapContainer}>
              <Text style={styles.titleText2}>지도</Text>

              <Map x={detailArtwork?.gpsY} y={detailArtwork?.gpsX} />
            </View>
            {reviews?.length > 0 ? (
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.titleText2}>작성된 리뷰</Text>
                <View style={{ width: "75%" }}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: spacing.sm }}
                  >
                    {reviews.map((item, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "column",
                          // borderWidth: 1,
                          width: 160,
                          marginRight: 15,
                        }}
                      >
                        <ReviewImageSlider images={item.images} />
                        <View
                          style={{
                            justifyContent: "center",
                            marginVertical: 15,
                            width: "100%",
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: "normal",
                              fontSize: 12,
                              flexShrink: 1,
                              color: "gray",
                              textAlign: "center",
                            }}
                          >
                            {item.displayName}님의 리뷰
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            ) : (
              <></>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdropTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ModalContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderTopLeftRadius: spacing.md,
    borderTopRightRadius: spacing.md,
    minHeight: 300,
    maxHeight: "80%",
    overflow: "scroll",
    flex: 1,
    flexDirection: "column",
  },
  ModalContent: { paddingBottom: spacing.xl },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  overlayContent: {
    padding: spacing.xl,
    borderRadius: spacing.xs,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
  },
  titleText1: {
    fontWeight: "bold",
    fontSize: fontSize.md,
    width: "100%",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  titleContainer: {
    width: "100%",
    borderColor: "transparent",
    borderBottomColor: colors.lightGray,
    borderBottomWidth: 1,
    marginBottom: spacing.xl,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  titleText2: {
    width: "20%",
    fontWeight: "bold",
    fontSize: fontSize.sm,
    marginRight: spacing.sm,
    paddingTop: 2,
  },
  subText: {
    fontWeight: "normal",
    fontSize: fontSize.sm,
    flexShrink: 1,
    color: "gray",
  },
  IconContainer: {
    marginBottom: 2,
    width: "100%",
    height: 30,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  linkIcon: {
    marginBottom: 2,
    flexDirection: "row",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginBottom: spacing.sm,
    width: "100%",
    flexDirection: "row",
    padding: spacing.sm,
  },
  imageContainer: {
    width: "100%",
    height: 400,
    paddingVertical: spacing.xxxl,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "auto",
    alignSelf: "center",
    overflow: "hidden",
  },

  imageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  mapContainer: {
    height: 400,
    marginBottom: spacing.sm,
    width: "100%",
    flexDirection: "row",
    border: "solid",
    padding: spacing.sm,
  },
});
