import { Platform, type ViewStyle } from "react-native"

const isWeb = Platform.OS === "web"

function centered(maxWidth: number): ViewStyle {
  return {
    width: isWeb ? "100%" : undefined,
    maxWidth: isWeb ? maxWidth : undefined,
    alignSelf: isWeb ? "center" : undefined,
  }
}

/**
 * Contenedores centrados solo en web (en nativo no cambian nada).
 * - webForm: formularios estrechos (login, registro).
 * - webContent: contenido general, igual que Home (640).
 */
export const layout = {
  webForm: centered(480),
  webContent: centered(640),
} satisfies Record<string, ViewStyle>
