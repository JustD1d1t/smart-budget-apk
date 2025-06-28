import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

type Pantry = { id: string; name: string };

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (pantryId: string) => void;
    pantries: Pantry[]
}

export default function PantrySelectModal({ isOpen, onClose, onSelect }: Props) {
    const [pantries, setPantries] = useState<Pantry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const fetchPantries = async () => {
            setLoading(true);
            const { data, error } = await supabase.from("pantries").select("id, name");
            if (!error && data) setPantries(data);
            setLoading(false);
        };

        fetchPantries();
    }, [isOpen]);

    return (
        <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Wybierz spiżarnię</Text>

                    {loading ? (
                        <ActivityIndicator testID="loading-indicator" size="large" />
                    ) : (
                        <ScrollView contentContainerStyle={styles.list}>
                            {pantries.map((pantry) => (
                                <TouchableOpacity
                                    key={pantry.id}
                                    style={styles.button}
                                    onPress={() => {
                                        onSelect(pantry.id);
                                        onClose();
                                    }}
                                >
                                    <Text style={styles.buttonText}>{pantry.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
                        <Text style={styles.buttonText}>Anuluj</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    modal: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        width: "100%",
        maxHeight: "80%",
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
        textAlign: "center",
    },
    list: {
        gap: 12,
        paddingBottom: 16,
    },
    button: {
        backgroundColor: "#2563eb",
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    cancel: {
        backgroundColor: "#6b7280",
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
    },
});
