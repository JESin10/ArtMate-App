import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import React from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function ReviewModal({ visible, onClose }) {
  const [text, onChangeText] = React.useState("");
  const [number, onChangeNumber] = React.useState("");
  const [isDatePickerVisible, setDatePickerVisible] = React.useState(false);

  const handleConfirm = (date) => {
    // date 처리 (예: YYYY-MM-DD 문자열로 저장)
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    onChangeNumber(`${yyyy}-${mm}-${dd}`);
    setDatePickerVisible(false);
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
            <Text>Review 작성 폼</Text>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="전시제목을 입력하세요"
                editable
                multiline
                maxLength={30}
                style={styles.titleInput}
              />
              <TextInput
                placeholder="후기내용을 입력하세요"
                editable
                multiline
                maxLength={300}
                onChangeText={(text) => onChangeText(text)}
                value={text}
                // onChangeText={onChangeText}
                style={styles.contentInput}
              />
              <TextInput
                vlaue={number}
                keyboardType="numeric"
                placeholder="방문일자를 입력하세요"
                onChangeText={onChangeNumber}

                // style={styles.contentInput}
              />
              <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                <TextInput
                  value={number}
                  editable={false}
                  placeholder="방문일자를 입력하세요"
                  style={styles.titleInput}
                />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={() => setDatePickerVisible(false)}
              />
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
  inputContainer: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "black",
    flexDirection: "column",
    alignItems: "center",
  },
  titleInput: {
    width: "90%",
    borderWidth: 1,
    borderColor: "blue",
    margin: 10,
    padding: 10,
  },
  contentInput: {
    width: "90%",
    height: 300,

    borderWidth: 1,
    borderColor: "red",
    margin: 10,
    padding: 10,
  },
});
