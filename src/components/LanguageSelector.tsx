import { Pressable, StyleSheet, Text, View } from "react-native"
import { colors } from "../constants/colors"
import { useLanguage } from "../hooks/useLanguage"
import { LANGUAGES } from "../i18n/translations"

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useLanguage()

  return (
    <View style={styles.container}>
      {!compact ? <Text style={styles.label}>{t("language")}</Text> : null}
      <View style={styles.row} accessibilityRole="radiogroup">
        {LANGUAGES.map((lang) => {
          const active = language === lang.code
          return (
            <Pressable
              key={lang.code}
              onPress={() => setLanguage(lang.code)}
              style={({ pressed }) => [
                styles.option,
                active && styles.optionActive,
                pressed && styles.optionPressed,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={lang.label}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                {lang.shortLabel} · {lang.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  option: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  optionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  optionPressed: {
    opacity: 0.8,
  },
  optionText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  optionTextActive: {
    color: colors.text,
  },
})
