import { Linking, Pressable, StyleSheet, Text, View } from "react-native"
import { colors } from "../constants/colors"

type FooterLink = {
  label: string
  url: string
  icon: string
}

const LINKS: FooterLink[] = [
  { icon: "@", label: "Email", url: "mailto:irenealcainealvarez@gmail.com" },
  { icon: "in", label: "LinkedIn", url: "https://linkedin.com/in/irenealcaine" },
  { icon: "/", label: "GitHub", url: "https://github.com/irenealcaine" },
]

export function AppFooter() {
  return (
    <View style={styles.container}>
      {LINKS.map((link) => (
        <Pressable
          key={link.label}
          onPress={() => Linking.openURL(link.url)}
          style={({ pressed }) => [styles.link, pressed && styles.pressed]}
        >
          <Text style={styles.icon}>{link.icon}</Text>
          <Text style={styles.label}>{link.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  pressed: {
    opacity: 0.6,
  },
  icon: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "700",
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    textAlign: "center",
    lineHeight: 18,
    overflow: "hidden",
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: "monospace",
  },
})
