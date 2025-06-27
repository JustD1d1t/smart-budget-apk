// app/home.tsx
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../components/ui/Button';
import { useUserStore } from '../stores/userStore';

const routes = [
  { label: 'Listy zakupowe', path: '/shopping-lists' },
  { label: 'Przepisy', path: '/recipes' },
  { label: 'Wydatki', path: '/expenses' },
  { label: 'Spiżarnie', path: '/pantries' },
  { label: 'Znajomi', path: '/friends' },
] as const;

export default function Home() {
  const { user, loading } = useUserStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !loading && !user) {
      router.replace('/login');
    }
  }, [mounted, loading, user, router]);

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
      <View style={styles.grid}>
        {routes.map(({ label, path }, index) => (
          <View key={path} style={styles.tileContainer}>
            <Button
              onPress={() => router.push(path)}
              variant="neutral"
              style={styles.tile}
            >
              {label}
            </Button>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');
const COLUMNS = 2;
const TILE_MARGIN = 8;
const TILE_SIZE = (width - TILE_MARGIN * (COLUMNS + 1)) / COLUMNS;

const styles = StyleSheet.create({
  container: {
    padding: TILE_MARGIN,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8
  },
  tileContainer: {
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  tile: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
});
