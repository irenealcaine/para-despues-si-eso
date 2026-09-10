import { ScrollView, StyleSheet, Text } from "react-native"
import { Screen } from "./Screen"
import { colors } from "../constants/colors"
import { useLanguage } from "../hooks/useLanguage"

export function ConfigError() {
  const { t } = useLanguage()
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t("configMissingTitle")}</Text>
        <Text style={styles.body}>
          {t("configMissingBody")}
        </Text>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  body: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
})
