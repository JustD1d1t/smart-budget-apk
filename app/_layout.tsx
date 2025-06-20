import { Stack, useRouter } from "expo-router";
import { Button } from "react-native";
import FlashMessage from "react-native-flash-message";
import { useUserStore } from "../stores/userStore";

export default function Layout() {
  const router = useRouter();
  const { user, logout } = useUserStore();

  return (
    <>
      <Stack
        screenOptions={{
          headerRight: () =>
            user ? (
              <Button
                title="Wyloguj"
                onPress={async () => {
                  await logout();
                  router.replace("/login");
                }}
              />
            ) : null,
        }}
      />
      <FlashMessage position="top" /> {/* ← TO DODAJ */}
    </>
  );
}
