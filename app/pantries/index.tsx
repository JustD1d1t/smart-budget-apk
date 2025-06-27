// app/pantries/index.tsx
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import PantryItem from "../../components/pantries/PantryItem";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Toast from "../../components/ui/Toast";
import { usePantriesStore } from "../../stores/pantriesStore";

export default function PantryListPage() {
    const [newPantryName, setNewPantryName] = useState("");
    const [nameError, setNameError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const router = useRouter();

    const showToast = (message: string, type: 'success' | 'error' = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const { pantries, loading, fetchPantries, addPantry, removePantry, renamePantry } =
        usePantriesStore();

    useEffect(() => {
        fetchPantries();
    }, []);

    const handleAddPantry = async () => {
        if (!newPantryName.trim()) {
            setNameError("Nazwa nie może być pusta.");
            return;
        }
        setNameError(null);

        const result = await addPantry(newPantryName.trim());
        if (!result.success) {
            showToast(result.error || "Błąd podczas dodawania spiżarni.", "error");
            return;
        }

        setNewPantryName("");
        showToast("Spiżarnia dodana pomyślnie!", "success");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📦 Twoje spiżarnie</Text>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <Input
                label="Nazwa spiżarni"
                placeholder="np. Spiżarnia domowa"
                value={newPantryName}
                onChangeText={setNewPantryName}
                error={nameError || undefined}
            />

            <Button onPress={handleAddPantry} variant="confirm">
                Dodaj spiżarnię
            </Button>

            {loading ? (
                <ActivityIndicator style={styles.loader} />
            ) : pantries.length === 0 ? (
                <Text style={styles.empty}>Brak spiżarni.</Text>
            ) : (
                <FlatList
                    data={pantries}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PantryItem
                            pantry={item}
                            onOpen={() => router.push(`/pantries/${item.id}`)}
                        />
                    )}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, gap: 12, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
    loader: { marginTop: 20 },
    empty: { textAlign: "center", color: "#888", marginTop: 20 },
    list: { gap: 8 },
});
