import { StyleSheet, type ViewProps } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { colors } from "../constants/colors"

type ScreenProps = ViewProps

export function Screen({ style, children, ...props }: ScreenProps) {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={["top", "bottom"]} {...props}>
      {children}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
})