import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Linking,
  Alert,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { decode } from "html-entities"; // 추가: HTML 엔티티 디코드
import BookmarkIcon from "../../assets/icons/bookmark.svg";
import FilledBookmarkIcon from "../../assets/icons/bookmark-filled.svg";
import ShareIcon from "../../assets/icons/share.svg";
import InfoIcon from "../../assets/icons/info.svg";
import { AuthContext } from "../../services/context";
import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  serverTimestamp,
  getDocs,
  collection,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { use } from "react";

export default function ArtworkInfoModal({
  visible,
  onClose,
  artwork,
  detail,
  seq,
}) {
  const [filled, setFilled] = useState(false);
  const { user, setUser } = useContext(AuthContext);

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

    return String(dateStr) ?? "";
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

  useEffect(() => {
    if (user && artwork) {
      getBookmarks(user.uid);
    }
  });

  // 북마크 여부 가져오기
  const getBookmarks = async (uid) => {
    try {
      const bookmarksSnapshot = await getDocs(
        collection(db, "users", uid, "bookmarks"),
      );
      const bookmarks = bookmarksSnapshot.docs.map((doc) => doc.data());
      const isBookmarked = bookmarks.some(
        (b) => b.artworkSeq === String(artwork.seq),
      );
      setFilled(isBookmarked);
      console.log("bookmark check", isBookmarked);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  //북마크 하기
  const BookmarkHandler = async () => {
    if (!user) {
      Alert.alert("알림", "로그인 후 이용가능합니다.");
      return;
    }

    const seq = String(artwork.seq);
    const uid = String(user.uid);
    const img = (artwork?.imgUrl ?? "").replace("http", "https");

    const bookmarkRef = doc(db, "users", uid, "bookmarks", seq);
    const artworkRef = doc(db, "artworks", seq);

    try {
      if (!filled) {
        // 1️⃣ 유저 북마크 저장
        await setDoc(bookmarkRef, {
          artworkSeq: seq,
          artworkTitle: artwork.title ?? "",
          artworkImgUrl: img,
          createdAt: serverTimestamp(),
        });

        // 2️⃣ 작품 컬렉션에 count 증가 (문서 없으면 자동 생성)
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
        Alert.alert("북마크", "북마크에 추가되었습니다.");
      } else {
        // 1️⃣ 유저 북마크 삭제
        await deleteDoc(bookmarkRef);

        // 2️⃣ 작품 count 감소
        await updateDoc(artworkRef, {
          bookmarkCount: increment(-1),
        });

        setFilled(false);
        Alert.alert("북마크", "북마크에서 제거되었습니다.");
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
              {artwork?.imgUrl ? (
                <ImageBackground
                  source={{ uri: artwork.imgUrl.replace("http", "https") }}
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
                  Alert.alert("공유하기", "공유하기 기능은 곧 업데이트됩니다.")
                }
              >
                <ShareIcon width={24} height={24} />
              </TouchableOpacity>
              {filled ? (
                <TouchableOpacity onPress={() => BookmarkHandler()}>
                  <FilledBookmarkIcon width={24} height={24} fill="#608D00" />
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
              <Text style={styles.titleText1}>{artwork?.title}</Text>
            </View>
            {/* <View style={styles.textContainer}>
              <Text style={styles.titleText2}>작가</Text>
              <Text style={styles.subText}>{artwork?.DP_ARTIST}</Text>
            </View> */}

            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>전시기간</Text>
              <Text style={styles.subText}>
                {Dateformat(artwork?.startDate)} ~{" "}
                {Dateformat(artwork?.endDate)}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>전시장소</Text>
              <Text style={styles.subText}>{artwork?.place}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>입장료</Text>
              {artwork?.price ? (
                <Text style={styles.subText}> {artwork?.price} </Text>
              ) : (
                <Text style={styles.subText}> 정보없음</Text>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>주소</Text>
              <Text style={styles.subText}>{artwork?.placeAddr}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>홈페이지</Text>
              {artwork?.url ? (
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
                          onPress: () => openLink(artwork.url),
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
              {artwork?.contents1 ? (
                <Text style={styles.subText}>
                  {htmlToPlain(artwork?.contents1)}
                </Text>
              ) : (
                <Text style={styles.subText}> 정보없음</Text>
              )}
            </View>
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
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    minHeight: 300,
    maxHeight: "80%",
    // height: "80%",
    overflow: "scroll",
    flex: 1,
    flexDirection: "column",
  },
  ModalContent: { paddingBottom: 20 },
  titleText1: {
    fontWeight: "bold",
    fontSize: 16,
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  titleContainer: {
    width: "100%",
    borderColor: "transparent",
    borderBottomColor: "#C6C6C6",
    borderBottomWidth: 1,
    marginBottom: 20,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  titleText2: {
    width: "20%",
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 10,
    paddingTop: 2,
  },
  subText: {
    fontWeight: "normal",
    fontSize: 12,
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
    marginBottom: 10,
    width: "100%",
    flexDirection: "row",
    padding: 10,
  },
  imageContainer: {
    width: "100%",
    height: 400,
    paddingVertical: 30,
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
    backgroundColor: "#e8e8e8",
  },
});
