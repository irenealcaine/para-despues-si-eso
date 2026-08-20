import { StyleSheet, ActivityIndicator, View } from "react-native"
import { colors } from "../constants/colors"

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
})