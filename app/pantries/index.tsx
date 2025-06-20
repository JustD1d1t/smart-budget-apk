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
            setToast({ message: result.error || "Błąd podczas dodawania spiżarni.", type: "error" });
            return;
        }

        setNewPantryName("");
        setToast({ message: "Spiżarnia dodana pomyślnie!", type: "success" });
    };

    const handleRemovePantry = async (id: string) => {
        await removePantry(id);
        setToast({ message: "Usunięto spiżarnię", type: "success" });
    };

    const handleRenamePantry = async (id: string, newName: string) => {
        if (!newName.trim()) {
            setToast({ message: "Nazwa nie może być pusta.", type: "error" });
            return;
        }
        await renamePantry(id, newName.trim());
        setToast({ message: "Zmieniono nazwę spiżarni", type: "success" });
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

            <Button onPress={handleAddPantry} variant="confirm" style={styles.addBtn}>
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
                            onRemove={item.isOwner ? handleRemovePantry : undefined}
                            onRename={item.isOwner ? (newName) => handleRenamePantry(item.id, newName) : undefined}
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
    addBtn: { marginBottom: 20 },
    loader: { marginTop: 20 },
    empty: { textAlign: "center", color: "#888", marginTop: 20 },
    list: { paddingBottom: 20 },
});
