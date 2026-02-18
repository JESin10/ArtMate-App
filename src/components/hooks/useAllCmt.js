import { View, Text } from "react-native";
import React, { useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const useAllCmt = () => {
  const [comments, setComments] = useState([]);
  const [userInfo, setUserInfo] = useState({});

  return (
    <View>
      <Text>useAllCmt</Text>
    </View>
  );
};

export default useAllCmt;
