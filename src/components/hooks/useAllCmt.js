import { View, Text } from "react-native";
import React, { useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";

const useAllCmt = () => {
  const [comments, setComments] = useState([]);
  const [userInfo, setUserInfo] = useState({});

  const getComment = async (reviewId) => {
    try {
      await getDoc(collection(db, "reviews", reviewId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View>
      <Text>useAllCmt</Text>
    </View>
  );
};

export default useAllCmt;
