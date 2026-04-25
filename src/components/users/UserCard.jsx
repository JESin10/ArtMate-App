import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FollowUser } from "../../services/followService";
import { colors } from "../../styles/colors";
import { fontSize, radius, spacing } from "../../styles/theme";

export default function UserCard({
  u,
  user,
  followingMap,
  expireAt,
  navigation,
}) {
  return (
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
            try {
              await FollowUser({
                user,
                targetUser: u,
                isFollowing: !!followingMap[u.id],
                expireAt,
              });
            } catch (error) {
              console.log(error);
            }
          }}
        >
          <Text style={{ color: "white", fontSize: 12 }}>
            {followingMap[u.id] ? "팔로잉" : "팔로우"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    width: 110,
    marginRight: spacing.md,
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: spacing.sm,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.lightGray,
    marginBottom: 6,
    overflow: "hidden",
  },
  userName: {
    fontWeight: "bold",
    fontSize: fontSize.sm,
  },

  userDesc: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  followBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
    marginTop: spacing.sm,
    height: 20,
  },
});
