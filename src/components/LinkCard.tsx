import { StyleSheet, Text, View } from "react-native"
import { colors } from "../constants/colors"
import type { SavedLink } from "../types/link"
import { formatTimestamp } from "../utils/date"

const PLATFORM_LABELS: Record<SavedLink["platform"], string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  other: "Other",
}

const TYPE_LABELS: Record<SavedLink["type"], string> = {
  video: "Video",
  webpage: "Webpage",
  unknown: "Unknown",
}

export function LinkCard({ link }: { link: SavedLink }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {link.title}
        </Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{link.category}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          {PLATFORM_LABELS[link.platform]} · {TYPE_LABELS[link.type]}
        </Text>
        <Text style={styles.meta}>{formatTimestamp(link.createdAt)}</Text>
      </View>

      <Text style={styles.url} numberOfLines={1}>
        {link.url}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  url: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 8,
  },
})