import { Alert, Platform } from "react-native"

/**
 * Confirmación destructiva compatible con web y nativo.
 * En web `Alert.alert` es un no-op (react-native-web), así que se usa
 * el diálogo nativo del navegador.
 */
export function confirmDestructive(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void,
): void {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) {
      onConfirm()
    }
    return
  }

  Alert.alert(title, message, [
    { text: "Cancelar", style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ])
}
