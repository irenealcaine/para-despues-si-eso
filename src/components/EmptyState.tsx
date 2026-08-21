import { StyleSheet, Text, View } from "react-native"
import { colors } from "../constants/colors"

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>—</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 6,
  },
  icon: {
    color: colors.border,
    fontSize: 24,
    marginBottom: 4,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
})
