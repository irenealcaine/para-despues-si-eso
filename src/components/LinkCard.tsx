import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { useEffect, useState } from "react"
import { colors } from "../constants/colors"
import { useLanguage } from "../hooks/useLanguage"
import type { SavedLink } from "../types/link"
import { formatTimestamp } from "../utils/date"

const PLATFORM_LABELS: Record<SavedLink["platform"], string> = {
  youtube: "YT",
  instagram: "IG",
  twitter: "X",
  threads: "TH",
  other: "WEB",
}

type Props = {
  link: SavedLink
  onDelete: (linkId: string) => void
  onEditTitle: (linkId: string, newTitle: string) => Promise<void>
  isLatest?: boolean
}

export function LinkCard({ link, onDelete, onEditTitle, isLatest = false }: Props) {
  const { language, t } = useLanguage()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(link.title)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  useEffect(() => {
    if (!editing) {
      setDraft(link.title)
    }
  }, [link.title, editing])
  const confirmDelete = () => {
    const message = t("deleteLinkConfirm", { title: link.title })
    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        onDelete(link.id)
      }
      return
    }
    Alert.alert(t("deleteLinkTitle"), message, [
      { text: t("cancel"), style: "cancel" },
      { text: t("delete"), style: "destructive", onPress: () => onDelete(link.id) },
    ])
  }

  const startEditing = () => {
    setDraft(link.title)
    setEditError(null)
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setDraft(link.title)
    setEditError(null)
  }

  const saveEditing = async () => {
    if (saving) return
    const trimmed = draft.trim()
    if (!trimmed) {
      setEditError(t("titleEmpty"))
      return
    }
    if (trimmed === link.title) {
      setEditing(false)
      return
    }
    setSaving(true)
    setEditError(null)
    try {
      await onEditTitle(link.id, trimmed)
      setEditing(false)
    } catch {
      setEditError(t("titleSaveFailed"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={[styles.card, isLatest && styles.cardLatest]}>
      <View style={[styles.leftAccent, isLatest && styles.leftAccentLatest]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          {isLatest ? (
            <Text style={styles.latestBadge} accessibilityLabel={t("latestLinkAccessibility")}>
              {t("newBadge")}
            </Text>
          ) : null}
          {editing ? (
            <View style={styles.editBox}>
              <TextInput
                style={styles.editInput}
                value={draft}
                onChangeText={setDraft}
                autoFocus
                editable={!saving}
                onSubmitEditing={saveEditing}
                returnKeyType="done"
                accessibilityLabel={t("editLinkTitleAccessibility")}
              />
              {editError ? (
                <Text style={styles.editError}>{editError}</Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.title} numberOfLines={2}>
              {link.title}
            </Text>
          )}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            <Text style={styles.platform}>{PLATFORM_LABELS[link.platform]}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.date}>{formatTimestamp(link.createdAt, language)}</Text>
          </View>

          <View style={styles.actions}>
            {editing ? (
              <>
                <Pressable
                  onPress={saveEditing}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.iconBtn,
                    pressed && styles.pressed,
                  ]}
                  accessibilityLabel={t("saveTitleAccessibility")}
                >
                  <Text style={styles.iconSave}>✓</Text>
                </Pressable>
                <View style={styles.separator} />
                <Pressable
                  onPress={cancelEditing}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.iconBtn,
                    pressed && styles.pressed,
                  ]}
                  accessibilityLabel={t("cancelEditAccessibility")}
                >
                  <Text style={styles.iconCancel}>×</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  onPress={() => Linking.openURL(link.url)}
                  style={({ pressed }) => [
                    styles.iconBtn,
                    pressed && styles.pressed,
                  ]}
                  accessibilityLabel={t("openLinkAccessibility")}
                >
                  <Text style={styles.iconOpen}>↗</Text>
                </Pressable>
                <View style={styles.separator} />
                <Pressable
                  onPress={startEditing}
                  style={({ pressed }) => [
                    styles.iconBtn,
                    pressed && styles.pressed,
                  ]}
                  accessibilityLabel={t("editTitleAccessibility")}
                >
                  <Text style={styles.iconEdit}>✎</Text>
                </Pressable>
                <View style={styles.separator} />
                <Pressable
                  onPress={confirmDelete}
                  style={({ pressed }) => [
                    styles.iconBtn,
                    pressed && styles.pressed,
                  ]}
                  accessibilityLabel={t("deleteLinkAccessibility")}
                >
                  <Text style={styles.iconDelete}>×</Text>
                </Pressable>
              </>
            )}
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
  cardLatest: {
    backgroundColor: colors.surfaceAlt,
  },
  leftAccent: {
    width: 2,
    backgroundColor: colors.border,
  },
  leftAccentLatest: {
    backgroundColor: colors.accent,
  },
  latestBadge: {
    color: colors.background,
    backgroundColor: colors.accent,
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 0.8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    alignSelf: "flex-start",
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
  iconEdit: {
    color: colors.textMuted,
    fontSize: 16,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  iconSave: {
    color: colors.success,
    fontSize: 18,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  iconCancel: {
    color: colors.textMuted,
    fontSize: 22,
    fontFamily: "monospace",
    fontWeight: "700",
    marginTop: -1,
  },
  editBox: {
    flex: 1,
    gap: 4,
  },
  editInput: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderFocus,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  editError: {
    color: colors.danger,
    fontSize: 11,
    fontFamily: "monospace",
  },
  separator: {
    width: 1,
    height: 18,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
})
