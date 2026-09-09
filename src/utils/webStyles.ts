import { Platform } from "react-native"
import { colors } from "../constants/colors"

let injected = false

/**
 * Estilos globales solo para web (scrollbars finos a juego con el tema).
 * En nativo no hace nada. Se importa por efecto lateral en index.ts.
 */
export function injectWebStyles(): void {
  if (Platform.OS !== "web" || injected || typeof document === "undefined") return
  injected = true

  const style = document.createElement("style")
  style.id = "app-web-styles"
  style.textContent = `
    * {
      scrollbar-width: thin;
      scrollbar-color: ${colors.borderFocus} transparent;
    }
    *::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    *::-webkit-scrollbar-track {
      background: transparent;
    }
    *::-webkit-scrollbar-thumb {
      background: ${colors.borderFocus};
      border-radius: 8px;
      border: 2px solid ${colors.background};
    }
    *::-webkit-scrollbar-thumb:hover {
      background: ${colors.accent};
    }
  `
  document.head.appendChild(style)
}
