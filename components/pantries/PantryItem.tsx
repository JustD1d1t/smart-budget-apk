// components/pantries/PantryItem.tsx

import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

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
                        <TouchableOpacity style={styles.button} onPress={handleSave}>
                            <Text style={styles.buttonText}>Zapisz</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.outline]}
                            onPress={() => setIsEditing(false)}
                        >
                            <Text style={styles.buttonText}>Anuluj</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <>
                    <Text style={styles.title}>{pantry.name}</Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.outline]}
                            onPress={() => onOpen(pantry.id)}
                        >
                            <Text style={styles.buttonText}>Otwórz</Text>
                        </TouchableOpacity>
                        {pantry.isOwner && (
                            <>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        setName(pantry.name);
                                        setIsEditing(true);
                                    }}
                                >
                                    <Text style={styles.buttonText}>Edytuj</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.danger]}
                                    onPress={() => onRemove?.(pantry.id)}
                                >
                                    <Text style={styles.buttonText}>Usuń</Text>
                                </TouchableOpacity>
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
        backgroundColor: "#10b981",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    outline: {
        backgroundColor: "#e5e7eb",
    },
    danger: {
        backgroundColor: "#ef4444",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
    },
});
