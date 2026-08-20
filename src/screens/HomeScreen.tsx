import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native"
import { AppFooter } from "../components/AppFooter"
import { Button } from "../components/Button"
import { EmptyState } from "../components/EmptyState"
import { LinkCard } from "../components/LinkCard"
import { Screen } from "../components/Screen"
import { colors } from "../constants/colors"
import { useAuth } from "../hooks/useAuth"
import { useSavedLinks } from "../hooks/useSavedLinks"
import type { RootStackParamList } from "../navigation/types"

type Props = NativeStackScreenProps<RootStackParamList, "Home">

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth()
  const userId = user?.uid ?? ""
  const { links, loading, error } = useSavedLinks(userId)

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Para después</Text>
        <View style={styles.headerActions}>
          <Button title="Settings" onPress={() => navigation.navigate("Settings")} variant="secondary" />
          <Button title="Add link" onPress={() => navigation.navigate("AddLink")} />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <EmptyState title="Could not load your links" subtitle={error} />
        </View>
      ) : links.length === 0 ? (
        <EmptyState
          title="No saved links yet"
          subtitle="Share a link from YouTube, Instagram or any app to save it here."
        />
      ) : (
        <FlatList
          data={links}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LinkCard link={item} />}
          contentContainerStyle={styles.list}
          ListFooterComponent={<AppFooter />}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
})