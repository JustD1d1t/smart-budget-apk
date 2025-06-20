// app/pantries/index.tsx

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import PantryItem from "../../components/pantries/PantryItem";
import { usePantriesStore } from "../../stores/pantriesStore";

export default function PantryListPage() {
    const [newPantryName, setNewPantryName] = useState("");
    const [nameError, setNameError] = useState<string | null>(null);
    const router = useRouter();

    const {
        pantries,
        loading,
        fetchPantries,
        addPantry,
        removePantry,
        renamePantry,
    } = usePantriesStore();

    useEffect(() => {
        fetchPantries();
    }, []);

    const handleAddPantry = async () => {
        if (!newPantryName.trim()) {
            setNameError("Nazwa nie może być pusta.");
            return;
        }

        setNameError(null);
        const result = await addPantry(newPantryName);

        if (!result.success) {
            showMessage({
                message: result.error || "Błąd podczas dodawania spiżarni.",
                type: "danger",
            });
            return;
        }

        setNewPantryName("");
        showMessage({ message: "Spiżarnia dodana pomyślnie!", type: "success" });
    };

    const handleRemovePantry = async (id: string) => {
        await removePantry(id);
        showMessage({ message: "Usunięto spiżarnię", type: "success" });
    };

    const handleRenamePantry = async (id: string, newName: string) => {
        if (!newName.trim()) return;
        await renamePantry(id, newName);
        showMessage({ message: "Zmieniono nazwę spiżarni", type: "success" });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📦 Twoje spiżarnie</Text>

            <TextInput
                style={[styles.input, nameError ? styles.inputError : null]}
                placeholder="Nazwa spiżarni"
                value={newPantryName}
                onChangeText={setNewPantryName}
            />
            {nameError && <Text style={styles.errorText}>{nameError}</Text>}

            <TouchableOpacity style={styles.addButton} onPress={handleAddPantry}>
                <Text style={styles.addButtonText}>Dodaj spiżarnię</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator />
            ) : pantries.length === 0 ? (
                <Text>Brak spiżarni.</Text>
            ) : (
                <FlatList
                    data={pantries}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PantryItem
                            pantry={item}
                            onOpen={(id) => router.push(`/pantries/${id}`)}
                            onRemove={item.isOwner ? handleRemovePantry : undefined}
                            onRename={item.isOwner ? handleRenamePantry : undefined}
                        />
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    inputError: {
        borderColor: "#ef4444",
    },
    errorText: {
        color: "#ef4444",
        marginBottom: 8,
    },
    addButton: {
        backgroundColor: "#10b981",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    addButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});