// app/_layout.tsx
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Button from '../components/ui/Button';
import { useUserStore } from '../stores/userStore';
// import FlashMessage from 'react-native-flash-message';

export default function Layout() {
  const router = useRouter();
  const { user, logout } = useUserStore();

  return (
    <>
      <Stack
        screenOptions={{
          headerRight: () =>
            user ? (
              <View style={styles.headerButtonWrapper}>
                <Button
                  variant="danger"
                  onPress={async () => {
                    await logout();
                    router.replace('/login');
                  }}
                >
                  Wyloguj
                </Button>
              </View>
            ) : null,
        }}
      />
      {/* <FlashMessage position="top" /> */}
    </>
  );
}

const styles = StyleSheet.create({
  headerButtonWrapper: {
    marginRight: 12,
  },
});
