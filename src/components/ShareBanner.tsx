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
    type === "error" ? colors.danger : type === "success" ? colors.success : colors.primary

  return (
    <View
      style={[
        styles.overlay,
        { paddingTop: insets.top + 12, borderTopColor: bannerColor },
      ]}
    >
      <View style={styles.content}>
        {processing ? <ActivityIndicator color={colors.primary} /> : null}
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          {onSettingsPress ? (
            <Button title="Ajustes" onPress={onSettingsPress} variant="secondary" />
          ) : null}
          {onRetryPress && !processing ? (
            <Button title="Reintentar" onPress={onRetryPress} variant="secondary" />
          ) : null}
          {!processing ? (
            <Button title="Cerrar" onPress={onDismiss} variant="secondary" />
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
    borderTopWidth: 3,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  content: {
    alignItems: "center",
    gap: 12,
  },
  message: {
    color: colors.text,
    fontSize: 14,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
})