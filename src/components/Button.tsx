import type { ReactNode } from "react"
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { colors } from "../constants/colors"

type ButtonProps = {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: "primary" | "secondary" | "danger" | "ghost"
  compact?: boolean
}

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  compact = false,
}: ButtonProps) {
  const isDisabled = disabled || loading
  const labelColor = labelColors[variant]

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        variantStyles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} size="small" />
      ) : (
        <Text style={[styles.label, compact && styles.labelCompact, { color: labelColor }]}>
          {title}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 40,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  compact: {
    minHeight: 34,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  labelCompact: {
    fontSize: 13,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.4,
  },
})

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  ghost: {
    backgroundColor: "transparent",
  },
})

const labelColors: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: colors.onAccent,
  secondary: colors.text,
  danger: colors.onAccent,
  ghost: colors.text,
}

export function ButtonGroup({ children }: { children: ReactNode }) {
  return <View style={groupStyles.group}>{children}</View>
}

const groupStyles = StyleSheet.create({
  group: {
    flexDirection: "row",
    gap: 6,
  },
})
