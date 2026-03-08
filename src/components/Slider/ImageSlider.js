import React, { useRef, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

export default function ImageSlider({ images = [], height = 270 }) {
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
        style={{ flexDirection: "row", justifyContent: "center", marginTop: 8 }}
      >
        {images.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToIndex(index)}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              marginHorizontal: 4,
              backgroundColor: activeIndex === index ? "#000" : "#ccc",
            }}
          />
        ))}
      </View>
    </View>
  );
}
