import { StyleSheet, Text, View } from "react-native"
import { colors } from "../constants/colors"

export function AppFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.line}>irenealcainealvarez@gmail.com</Text>
      <Text style={styles.line}>linkedin.com/in/irenealcaine</Text>
      <Text style={styles.line}>github.com/irenealcaine</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  line: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
})