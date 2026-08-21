import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../constants/colors"
import type { BannerType } from "../hooks/usePendingLink"
import { Button } from "./Button"

type ShareBannerProps = {
  message: string
  type: BannerType
  processing?: boolean
  onSettingsPress?: () => void
  onRetryPress?: () => void
  onDismiss: () => void
}

export function ShareBanner({
  message,
  type,
  processing = false,
  onSettingsPress,
  onRetryPress,
  onDismiss,
}: ShareBannerProps) {
  const insets = useSafeAreaInsets()
  const bannerColor =
    type === "error" ? colors.danger : type === "success" ? colors.success : colors.accent

  return (
    <View
      style={[
        styles.overlay,
        { paddingTop: insets.top + 8, borderTopColor: bannerColor },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.row}>
          {processing ? (
            <ActivityIndicator color={colors.accent} size="small" />
          ) : null}
          <Text style={styles.message}>{message}</Text>
        </View>
        <View style={styles.actions}>
          {onSettingsPress ? (
            <Button
              title="Ajustes"
              onPress={onSettingsPress}
              variant="secondary"
              compact
            />
          ) : null}
          {onRetryPress && !processing ? (
            <Button
              title="Reintentar"
              onPress={onRetryPress}
              variant="secondary"
              compact
            />
          ) : null}
          {!processing ? (
            <Button title="Cerrar" onPress={onDismiss} variant="ghost" compact />
          ) : null}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    paddingHorizontal: 12,
    paddingBottom: 10,
    zIndex: 10,
  },
  content: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  message: {
    color: colors.text,
    fontSize: 12,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
})
