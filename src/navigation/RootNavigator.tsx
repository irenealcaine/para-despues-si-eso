import { DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { LoadingScreen } from "../components/LoadingScreen"
import { colors } from "../constants/colors"
import { useAuth } from "../hooks/useAuth"
import { AddLinkScreen } from "../screens/AddLinkScreen"
import { HomeScreen } from "../screens/HomeScreen"
import { LoginScreen } from "../screens/LoginScreen"
import { RegisterScreen } from "../screens/RegisterScreen"
import { SettingsScreen } from "../screens/SettingsScreen"
import { navigationRef } from "./navigationRef"
import type { RootStackParamList } from "./types"

const Stack = createNativeStackNavigator<RootStackParamList>()

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
}

export function RootNavigator() {
  const { user, initializing } = useAuth()

  if (initializing) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="AddLink" component={AddLinkScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}