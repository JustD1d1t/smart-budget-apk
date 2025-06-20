import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/ui/Button';
import { useUserStore } from '../stores/userStore';

const routes = [
  { label: 'Listy zakupowe', path: '/shopping-lists' },
  { label: 'Przepisy', path: '/recipes' },
  { label: 'Wydatki', path: '/expenses' },
  { label: 'Spiżarnie', path: '/pantries' },
  { label: 'Znajomi', path: '/friends' },
];

export default function Home() {
  const { user, loading } = useUserStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !loading && !user) {
      router.replace('/login');
    }
  }, [mounted, loading, user]);

  if (!mounted || loading || !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.text}>Witaj, {user.email}!</Text>
      {routes.map(({ label, path }) => (
        <Button
          key={path}
          onPress={() => router.push(path)}
          variant="neutral"
        >
          {label}
        </Button>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});
