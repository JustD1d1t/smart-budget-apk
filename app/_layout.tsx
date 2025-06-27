// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Button from '../components/ui/Button';
import { useUserStore } from '../stores/userStore';

export default function Layout() {
  const { user, logout } = useUserStore();

  return (
    <View style={styles.wrapper}>
      <Stack
        screenOptions={({ navigation }) => ({
          headerRight: () =>
            user ? (
              <View style={styles.headerButtonWrapper}>
                <Button
                  variant="danger"
                  onPress={async () => {
                    await logout();
                    navigation.replace('/login');
                  }}
                  style={styles.headerButton}
                >
                  Wyloguj
                </Button>
              </View>
            ) : null,
        })}
      >
        {/* Home */}
        <Stack.Screen name="index" options={{ title: 'Strona główna' }} />

        {/* Shopping Lists */}
        <Stack.Screen
          name="shopping-lists/index"
          options={{ title: 'Listy zakupowe' }}
        />
        <Stack.Screen
          name="shopping-lists/[id]"
          options={{ title: 'Lista zakupowa' }}
        />

        {/* Recipes */}
        <Stack.Screen name="recipes/index" options={{ title: 'Przepisy' }} />
        <Stack.Screen name="recipes/[id]" options={{ title: 'Przepis' }} />

        {/* Expenses */}
        <Stack.Screen name="expenses/index" options={{ title: 'Wydatki' }} />
        <Stack.Screen name="expenses/new" options={{ title: 'Nowy wydatek' }} />
        <Stack.Screen name="expenses/[id]" options={{ title: 'Wydatek' }} />

        {/* Pantries */}
        <Stack.Screen name="pantries/index" options={{ title: 'Spiżarnie' }} />
        <Stack.Screen name="pantries/[id]" options={{ title: 'Spiżarnia' }} />

        {/* Friends */}
        <Stack.Screen name="friends/index" options={{ title: 'Znajomi' }} />

        {/* Login (no header) */}
        <Stack.Screen name="login" options={{ headerShown: false }} />

        {/* Register */}
        <Stack.Screen name="register" options={{ title: 'Rejestracja' }} />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingBottom: 40,
  },
  headerButtonWrapper: {
    marginRight: 12,
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
