import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (listId: string) => void;
};

export default function ShoppingListSelectModal({
    isOpen,
    onClose,
    onSelect,
}: Props) {
    const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const fetchLists = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("shopping_lists")
                .select("id, name");

            if (!error && data) setLists(data);
            setLoading(false);
        };

        fetchLists();
    }, [isOpen]);

    return (
        <Modal
            visible={isOpen}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Wybierz listę zakupową</Text>

                    {loading ? (
                        <ActivityIndicator
                            testID="shoppinglist-loading"
                            size="large"
                        />
                    ) : lists.length === 0 ? (
                        <Text style={styles.info}>Brak dostępnych list.</Text>
                    ) : (
                        <ScrollView contentContainerStyle={styles.scroll}>
                            {lists.map((list) => (
                                <Pressable
                                    key={list.id}
                                    style={styles.listButton}
                                    onPress={() => {
                                        onSelect(list.id);
                                        onClose();
                                    }}
                                >
                                    <Text style={styles.listText}>
                                        {list.name}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    )}

                    <View style={styles.cancel}>
                        <Button title="Anuluj" onPress={onClose} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        padding: 16,
    },
    modal: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
        maxHeight: "80%",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
    },
    info: {
        textAlign: "center",
        color: "#6b7280",
        fontSize: 14,
        marginVertical: 8,
    },
    scroll: {
        gap: 12,
    },
    listButton: {
        padding: 12,
        backgroundColor: "#f3f4f6",
        borderRadius: 8,
        marginBottom: 8,
    },
    listText: {
        fontSize: 16,
    },
    cancel: {
        marginTop: 16,
    },
});
