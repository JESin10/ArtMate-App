import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { decode } from "html-entities";
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
import { usePlaceStore } from "../../store/usePlaceStore";
import { colors } from "../../styles/colors";

export default function PlacesInfoModal({
  visible,
  onClose,
  //detail
  seq,
}) {
  const { loading, detail, getDetailPlace } = usePlaceStore();
  const { user } = useContext(AuthContext);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (seq && visible) {
      getDetailPlace(seq);
    }
  }, [seq, visible]);

  // Modal 열릴 때 북마크 여부 가져오기
  useEffect(() => {
    if (!visible || !user || !seq) return;

    const checkBookmark = async () => {
      try {
        const bookmarkRef = doc(db, "users", user.uid, "pins", String(seq));
        const snap = await getDoc(bookmarkRef);
        setFilled(snap.exists());
      } catch (err) {
        console.error("Bookmark check error:", err);
        setFilled(false);
      }
    };

    checkBookmark();
  }, [visible, user?.uid, seq]);

  const openLink = async (rawUrl) => {
    if (!rawUrl) {
      Alert.alert("알림", "유효한 링크가 없습니다.");
      return;
    }
    let url = String(rawUrl).replace("http", "https");

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

  //장소 북마크
  const BookmarkHandler = async () => {
    if (!user) {
      Alert.alert("알림", "로그인 후 이용가능합니다.");
      return;
    }

    if (!detail?.seq) {
      console.warn("북마크할 작품 ID가 없습니다");
      return;
    }

    const uid = String(user.uid);
    const seqId = String(detail.seq); // 여기서 안전하게 id 가져오기
    const imgUrl = (detail?.culViewImg1 ?? "").replace("http", "https");
    const geoCode = {
      lat: Number(detail.gpsY),
      lng: Number(detail.gpsX),
    };
    const add = String(detail.culAddr);

    const bookmarkRef = doc(db, "users", uid, "pins", seqId);
    const placeRef = doc(db, "places", seqId);

    try {
      if (!filled) {
        // 북마크 추가
        await setDoc(bookmarkRef, {
          seq: seqId,
          placeName: detail.culName,
          placeImgUrl: imgUrl,
          createdAt: serverTimestamp(),
          geoCode,
          placeAdd: add,
        });

        // 작품 컬렉션 count 증가 (merge: true → 문서 없으면 생성)
        await setDoc(
          placeRef,
          {
            placeName: detail.culName,
            placeImgUrl: imgUrl,
            bookmarkCount: increment(1),
          },
          { merge: true },
        );

        setFilled(true);
        Alert.alert("안내", "북마크에 추가되었습니다.");
      } else {
        // 북마크 삭제
        await deleteDoc(bookmarkRef);
        await updateDoc(placeRef, {
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
            <View style={styles.image}>
              {detail?.culViewImg1 ? (
                <ImageBackground
                  source={{ uri: detail.culViewImg1.replace("http", "https") }}
                  style={styles.imageBackground}
                  resizeMode="contain"
                />
              ) : (
                <Text>No Image</Text>
              )}
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText1}>
                {detail?.culName} / {detail?.culGrpName}
              </Text>
              <View style={styles.IconContainer}>
                <TouchableOpacity
                  style={{ marginHorizontal: 12 }}
                  onPress={() =>
                    Alert.alert(
                      "공유하기",
                      "공유하기 기능은 곧 업데이트됩니다.",
                    )
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
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>주소</Text>
              <Text style={styles.subText}>{detail?.culAddr}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>우편번호</Text>
              <Text style={styles.subText}>{detail?.zipCode}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>전화번호</Text>
              <Text style={styles.subText}>{detail?.culTel}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>홈페이지</Text>
              {detail?.culHomeUrl ? (
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
                          onPress: () => openLink(detail.culHomeUrl),
                        },
                      ],
                      { cancelable: true },
                    )
                  }
                >
                  <InfoIcon width={20} height={20} style={{ marginRight: 8 }} />
                  <Text style={styles.subText}>홈페이지로 이동</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.subText}> 정보없음</Text>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.titleText2}>상세설명</Text>
              {detail?.culCont ? (
                <Text style={styles.subText}>
                  {htmlToPlain(detail?.culCont)}
                </Text>
              ) : (
                <Text style={styles.subText}> 정보없음</Text>
              )}
            </View>
            <View style={styles.mapContainer}>
              <Text style={styles.titleText2}>지도</Text>
              <Map
                x={detail?.gpsY}
                y={detail?.gpsX}
                // address={detail?.placeAddr}
              />
              {/* <Text style={styles.subText}>{detail?.gpsX}</Text>
              <Text style={styles.subText}>{detail?.gpsY}</Text> */}
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
    padding: 20,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
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
    paddingVertical: 20,
    paddingHorizontal: 10,
    width: "80%",
  },
  IconContainer: {
    marginBottom: 2,
    width: "20%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  linkIcon: {
    marginBottom: 2,
    flexDirection: "row",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    width: "100%",
    borderColor: "transparent",
    borderBottomColor: "#C6C6C6",
    borderBottomWidth: 1,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleText2: {
    width: "20%",
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 10,
    marginTop: 2,
  },
  subText: {
    fontWeight: "normal",
    fontSize: 12,
    flexShrink: 1,
    color: "gray",
  },
  textContainer: {
    marginBottom: 10,
    width: "100%",
    flexDirection: "row",
    border: "solid",
    padding: 10,
  },
  mapContainer: {
    height: 400,
    marginBottom: 10,
    width: "100%",
    flexDirection: "row",
    border: "solid",
    padding: 10,
  },
  image: {
    width: "100%",
    height: 250,
    marginVertical: 10,
    alignSelf: "center",
    overflow: "hidden",
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
