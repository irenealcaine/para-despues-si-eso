import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useCallback, useMemo } from "react"
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native"
import { AppFooter } from "../components/AppFooter"
import { EmptyState } from "../components/EmptyState"
import { SaveIcon, SettingsIcon } from "../components/Icon"
import { LinkCard } from "../components/LinkCard"
import { Screen } from "../components/Screen"
import { getCategoryLabel, getDefaultCategory } from "../constants/categories"
import { colors } from "../constants/colors"
import { useAuth } from "../hooks/useAuth"
import { useLanguage } from "../hooks/useLanguage"
import { useSavedLinks } from "../hooks/useSavedLinks"
import { deleteLink, updateLinkTitle } from "../services/firestoreService"
import type { RootStackParamList } from "../navigation/types"
import type { SavedLink } from "../types/link"

type Props = NativeStackScreenProps<RootStackParamList, "Home">

type Section = {
  title: string
  data: SavedLink[]
}

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const userId = user?.uid ?? ""
  const { links, loading, error } = useSavedLinks(userId)

  const handleDelete = useCallback(async (linkId: string) => {
    try {
      await deleteLink(linkId)
    } catch {
      // silent - onSnapshot will keep the list in sync
    }
  }, [])

  const handleEditTitle = useCallback(
    async (linkId: string, newTitle: string) => {
      await updateLinkTitle(linkId, newTitle)
    },
    [],
  )

  const latestId = links[0]?.id

  const sections = useMemo(() => {    const grouped = new Map<string, SavedLink[]>()
    for (const link of links) {
      const rawCategory = link.category ?? getDefaultCategory(language)
      const category = getCategoryLabel(rawCategory, language)
      const existing = grouped.get(category)
      if (existing) {
        existing.push(link)
      } else {
        grouped.set(category, [link])
      }
    }
    const result: Section[] = []
    for (const [title, data] of grouped) {
      result.push({ title, data })
    }
    const defaultCategory = getDefaultCategory(language)
    result.sort((a, b) => {
      if (a.title === defaultCategory) return 1
      if (b.title === defaultCategory) return -1
      return a.title.localeCompare(b.title, language === "en" ? "en" : "es")
    })
    return result
  }, [links, language])

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{t("appName")}</Text>
            <Text style={styles.count}>
              {links.length === 1
                ? t("savedCount_one")
                : t("savedCount_other", { count: links.length })}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate("Settings")}
              style={({ pressed }) => [
                styles.settingsBtn,
                pressed && styles.settingsBtnPressed,
              ]}
              accessibilityLabel={t("settingsAccessibility")}
            >
              <SettingsIcon size={20} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("AddLink")}
              style={({ pressed }) => [
                styles.addBtn,
                pressed && styles.addBtnPressed,
              ]}
              accessibilityLabel={t("addLinkAccessibility")}
            >
              <SaveIcon size={20} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} size="small" />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <EmptyState title={t("homeEmptyError")} subtitle={error} />
          </View>
        ) : sections.length === 0 ? (
          <EmptyState
            title={t("homeEmptyTitle")}
            subtitle={t("homeEmptySubtitle")}
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LinkCard
                link={item}
                onDelete={handleDelete}
                onEditTitle={handleEditTitle}
                isLatest={item.id === latestId}
              />
            )}
            renderSectionHeader={({ section }) => (
              <Text style={styles.sectionHeader}>{section.title}</Text>
            )}
            contentContainerStyle={styles.list}
            ListFooterComponent={<AppFooter />}
          />
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: Platform.OS === "web" ? 640 : undefined,
    width: Platform.OS === "web" ? "100%" : undefined,
    alignSelf: Platform.OS === "web" ? "center" : undefined,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: -0.3,
  },
  count: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: "monospace",
  },
  headerActions: {
    flexDirection: "row",
    gap: 6,
  },
  addBtn: {
    width: 38,
    height: 34,
    borderRadius: 6,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnPressed: {
    backgroundColor: colors.accentPressed,
  },
  settingsBtn: {
    width: 38,
    height: 34,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsBtnPressed: {
    backgroundColor: colors.borderFocus,
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  list: {
    paddingBottom: 24,
  },
  sectionHeader: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 4,
    fontFamily: "monospace",
  },
})
