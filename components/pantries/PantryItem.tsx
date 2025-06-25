// components/pantries/PantryItem.tsx
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../ui/Button";

interface Pantry {
    id: string;
    name: string;
    isOwner: boolean;
}

type Props = {
    pantry: Pantry;
    onOpen: (id: string) => void;
    onRemove?: (id: string) => void;
    onRename?: (id: string, newName: string) => void;
};

export default function PantryItem({ pantry, onOpen, onRemove, onRename }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(pantry.name);

    const handleSave = () => {
        if (onRename && name.trim()) {
            onRename(pantry.id, name.trim());
        }
        setIsEditing(false);
    };

    return (
        <View style={styles.container}>
            {isEditing ? (
                <>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        autoFocus
                        placeholder="Nowa nazwa"
                    />
                    <View style={styles.buttonRow}>
                        <Button onPress={handleSave} style={styles.button} variant="confirm">
                            Zapisz
                        </Button>
                        <Button onPress={() => setIsEditing(false)} style={[styles.button, styles.outline]} variant="neutral">
                            Anuluj
                        </Button>
                    </View>
                </>
            ) : (
                <>
                    <Text style={styles.title}>{pantry.name}</Text>
                    <View style={styles.buttonRow}>
                        <Button onPress={() => onOpen(pantry.id)} style={[styles.button, styles.outline]} variant="neutral">
                            Otwórz
                        </Button>
                        {pantry.isOwner && (
                            <>
                                <Button
                                    onPress={() => {
                                        setName(pantry.name);
                                        setIsEditing(true);
                                    }}
                                    style={styles.button}
                                    variant="confirm"
                                >
                                    Edytuj
                                </Button>
                                <Button onPress={() => onRemove?.(pantry.id)} style={[styles.button, styles.danger]} variant="danger">
                                    Usuń
                                </Button>
                            </>
                        )}
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#fff",
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 10,
        flexWrap: "wrap",
    },
    button: {
        flex: 1,
    },
    outline: {
        // override confirm background
    },
    danger: {
        // override confirm background
    },
});
