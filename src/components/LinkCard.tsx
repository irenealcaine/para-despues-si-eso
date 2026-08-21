import { Linking, Pressable, StyleSheet, Text, View } from "react-native"
import { colors } from "../constants/colors"
import type { SavedLink } from "../types/link"
import { formatTimestamp } from "../utils/date"

const PLATFORM_LABELS: Record<SavedLink["platform"], string> = {
  youtube: "YT",
  instagram: "IG",
  other: "WEB",
}

type Props = {
  link: SavedLink
  onDelete: (linkId: string) => void
}

export function LinkCard({ link, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.leftAccent} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={2}>
            {link.title}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            <Text style={styles.platform}>{PLATFORM_LABELS[link.platform]}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.category}>{link.category}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.date}>{formatTimestamp(link.createdAt)}</Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => Linking.openURL(link.url)}
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && styles.pressed,
              ]}
              accessibilityLabel="Open link"
            >
              <Text style={styles.iconOpen}>↗</Text>
            </Pressable>
            <View style={styles.separator} />
            <Pressable
              onPress={() => onDelete(link.id)}
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && styles.pressed,
              ]}
              accessibilityLabel="Delete link"
            >
              <Text style={styles.iconDelete}>×</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    marginBottom: 1,
    minHeight: 52,
  },
  leftAccent: {
    width: 2,
    backgroundColor: colors.border,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  platform: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "monospace",
    letterSpacing: 0.5,
  },
  category: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: "monospace",
  },
  date: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: "monospace",
  },
  dot: {
    color: colors.border,
    fontSize: 11,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    marginLeft: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
  iconOpen: {
    color: colors.textMuted,
    fontSize: 18,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  iconDelete: {
    color: colors.danger,
    fontSize: 22,
    fontFamily: "monospace",
    fontWeight: "700",
    marginTop: -1,
  },
  separator: {
    width: 1,
    height: 18,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
})
