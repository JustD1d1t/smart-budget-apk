// app/_layout.tsx
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Button from '../components/ui/Button';
import { useUserStore } from '../stores/userStore';

export default function Layout() {
  const { user, logout } = useUserStore();

  return (
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
      <Stack.Screen name="shopping-lists/index" options={{ title: 'Listy zakupowe' }} />
      <Stack.Screen
        name="shopping-lists/[id]"
        options={({ params }) => ({ title: params?.id ? `Lista ${params.id}` : 'Lista' })}
      />

      {/* Recipes */}
      <Stack.Screen name="recipes/index" options={{ title: 'Przepisy' }} />
      <Stack.Screen
        name="recipes/[id]"
        options={({ params }) => ({ title: params?.id ? `Przepis ${params.id}` : 'Przepis' })}
      />

      {/* Expenses */}
      <Stack.Screen name="expenses/index" options={{ title: 'Wydatki' }} />

      {/* Pantries */}
      <Stack.Screen name="pantries/index" options={{ title: 'Spiżarnie' }} />
      <Stack.Screen
        name="pantries/[id]"
        options={({ params }) => ({ title: params?.id ? `Spiżarnia ${params.id}` : 'Spiżarnia' })}
      />

      {/* Friends */}
      <Stack.Screen name="friends/index" options={{ title: 'Znajomi' }} />

      {/* Login (no header) */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerButtonWrapper: {
    marginRight: 12,
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
