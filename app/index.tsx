import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";
import { useUserStore } from "../stores/userStore";

export default function Home() {
  const { user, loading } = useUserStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !loading && !user) {
      router.replace("/login");
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
    <View style={styles.centered}>
      <Text style={styles.text}>Witaj, {user.email}!</Text>
      <Button title="Twoje listy zakupowe" onPress={() => router.push("/shopping-lists")} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  text: { fontSize: 18 },
});
