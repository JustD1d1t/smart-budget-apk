import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

type ShoppingList = {
    id: string;
    name: string;
    isOwner: boolean;
};

export default function ShoppingListsPage() {
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [loading, setLoading] = useState(true);
    const [newListName, setNewListName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const router = useRouter();

    const fetchLists = async () => {
        setLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        const { data: listData, error } = await supabase
            .from("shopping_lists")
            .select("id, name, owner_id");

        if (error) {
            Alert.alert("Błąd", "Nie udało się pobrać list");
        } else {
            const withOwnership = listData.map((list) => ({
                id: list.id,
                name: list.name,
                isOwner: list.owner_id === userId,
            }));
            setLists(withOwnership);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchLists();
    }, []);

    const handleAddList = async () => {
        if (!newListName.trim()) {
            Alert.alert("Błąd", "Nazwa nie może być pusta.");
            return;
        }

        const { data: userData, error: userError } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId || userError) {
            Alert.alert("Błąd", "Nie udało się pobrać użytkownika.");
            return;
        }

        const { data: listData, error: listError } = await supabase
            .from("shopping_lists")
            .insert({ name: newListName, owner_id: userId })
            .select()
            .single();

        if (listError || !listData) {
            Alert.alert("Błąd", "Nie udało się dodać listy.");
            return;
        }

        await supabase
            .from("shopping_list_members")
            .insert({ list_id: listData.id, user_id: userId, role: "owner" });

        setNewListName("");
        await fetchLists();
        Alert.alert("Sukces", "Lista dodana.");
    };

    const handleRemoveList = async (id: string) => {
        const { error } = await supabase.from("shopping_lists").delete().eq("id", id);
        if (!error) {
            setLists((prev) => prev.filter((list) => list.id !== id));
            Alert.alert("Usunięto", "Lista została usunięta.");
        } else {
            Alert.alert("Błąd", "Nie udało się usunąć listy.");
        }
    };

    const handleEditClick = (list: ShoppingList) => {
        setEditingId(list.id);
        setEditingName(list.name);
    };

    const handleRenameList = async (id: string) => {
        if (!editingName.trim()) return;
        const { error } = await supabase
            .from("shopping_lists")
            .update({ name: editingName })
            .eq("id", id);

        if (!error) {
            Alert.alert("Sukces", "Zmieniono nazwę listy.");
            setEditingId(null);
            setEditingName("");
            fetchLists();
        } else {
            Alert.alert("Błąd", "Nie udało się zmienić nazwy.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🛒 Twoje listy zakupowe</Text>

            <View style={styles.form}>
                <TextInput
                    placeholder="Nazwa listy"
                    style={styles.input}
                    value={newListName}
                    onChangeText={setNewListName}
                />
                <TouchableOpacity style={styles.button} onPress={handleAddList}>
                    <Text style={styles.buttonText}>Dodaj listę</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <Text>Ładowanie...</Text>
            ) : (
                <FlatList
                    data={lists}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ gap: 12 }}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            {editingId === item.id ? (
                                <>
                                    <TextInput
                                        value={editingName}
                                        onChangeText={setEditingName}
                                        style={styles.input}
                                    />
                                    <View style={styles.row}>
                                        <TouchableOpacity style={styles.button} onPress={() => handleRenameList(item.id)}>
                                            <Text style={styles.buttonText}>Zapisz</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.button, styles.outline]}
                                            onPress={() => setEditingId(null)}
                                        >
                                            <Text style={styles.outlineText}>Anuluj</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.listName}>{item.name}</Text>
                                    <View style={styles.row}>
                                        <TouchableOpacity
                                            style={[styles.button, styles.outline]}
                                            onPress={() => router.push(`/shopping-lists/${item.id}`)}
                                        >
                                            <Text style={styles.outlineText}>Otwórz</Text>
                                        </TouchableOpacity>
                                        {item.isOwner && (
                                            <>
                                                <TouchableOpacity style={styles.button} onPress={() => handleEditClick(item)}>
                                                    <Text style={styles.buttonText}>Edytuj</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.button, styles.danger]}
                                                    onPress={() => handleRemoveList(item.id)}
                                                >
                                                    <Text style={styles.buttonText}>Usuń</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                </>
                            )}
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    form: {
        gap: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
    },
    button: {
        backgroundColor: "#1f2937",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
    },
    outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#1f2937",
    },
    outlineText: {
        color: "#1f2937",
    },
    danger: {
        backgroundColor: "#dc2626",
    },
    card: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        padding: 16,
        gap: 8,
    },
    listName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
});
