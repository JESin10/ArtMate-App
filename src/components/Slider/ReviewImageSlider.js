import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../styles/colors";
import { spacing } from "../../styles/theme";

const { width } = Dimensions.get("window");

export default function ReviewImageSlider({
  images = [],
  height = 200,
  width = 160,
}) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slideWidth = width * 0.9;

  const goToIndex = (index) => {
    scrollRef.current?.scrollTo({
      x: slideWidth * index,
      animated: true,
    });
    setActiveIndex(index);
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / slideWidth,
          );
          setActiveIndex(index);
        }}
        scrollEventThrottle={16}
      >
        {images.map((img, index) => (
          <Image
            key={index}
            source={{ uri: img }}
            style={{
              width: slideWidth,
              height: height,
            }}
          />
        ))}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: spacing.xs,
        }}
      >
        {images.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToIndex(index)}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              marginHorizontal: spacing.xs,
              backgroundColor:
                activeIndex === index ? colors.black : colors.gray,
            }}
          />
        ))}
      </View>
    </View>
  );
}
