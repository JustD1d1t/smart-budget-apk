// app/friends/index.tsx

import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { supabase } from "../../lib/supabaseClient";
import { useFriendsStore } from "../../stores/friendsStore";

export default function FriendsPage() {
    const { friends, fetchFriends, sendInvite, acceptInvite, removeFriend } = useFriendsStore();
    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id ?? null);
        });
        fetchFriends();
    }, []);

    const handleSubmit = async () => {
        try {
            await sendInvite(email.trim());
            setEmail("");
            showMessage({ message: "Zaproszenie wysłane!", type: "success" });
        } catch (err: any) {
            showMessage({ message: err.message || "Błąd przy wysyłaniu zaproszenia", type: "danger" });
        }
    };

    const handleAccept = async (id: string) => {
        try {
            await acceptInvite(id);
            showMessage({ message: "Zaproszenie zaakceptowane!", type: "success" });
        } catch {
            showMessage({ message: "Błąd przy akceptowaniu", type: "danger" });
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await removeFriend(id);
            showMessage({ message: "Znajomy usunięty", type: "info" });
        } catch {
            showMessage({ message: "Błąd przy usuwaniu", type: "danger" });
        }
    };

    const sent = friends.filter((f) => f.requester_id === userId && f.status === "pending");
    const received = friends.filter((f) => f.recipient_id === userId && f.status === "pending");
    const accepted = friends.filter(
        (f) => f.status === "accepted" && (f.requester_id === userId || f.recipient_id === userId)
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Znajomi</Text>

            <View style={styles.formRow}>
                <TextInput
                    placeholder="Email znajomego"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                />
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Zaproś</Text>
                </TouchableOpacity>
            </View>

            {received.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.subHeader}>Otrzymane zaproszenia</Text>
                    {received.map((f) => (
                        <View key={f.id} style={styles.row}>
                            <Text>{f.user_email}</Text>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity onPress={() => handleAccept(f.id)} style={styles.smallButton}>
                                    <Text>Akceptuj</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleRemove(f.id)} style={styles.smallButton}>
                                    <Text>Usuń</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {sent.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.subHeader}>Wysłane zaproszenia</Text>
                    {sent.map((f) => (
                        <View key={f.id} style={styles.row}>
                            <Text>{f.user_email}</Text>
                            <TouchableOpacity onPress={() => handleRemove(f.id)} style={styles.smallButton}>
                                <Text>Usuń</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.subHeader}>Twoi znajomi</Text>
                {accepted.length === 0 ? (
                    <Text style={styles.emptyText}>Brak</Text>
                ) : (
                    accepted.map((f) => (
                        <View key={f.id} style={styles.row}>
                            <Text>{f.user_email}</Text>
                            <TouchableOpacity onPress={() => handleRemove(f.id)} style={styles.smallButton}>
                                <Text>Usuń</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
    subHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 8,
        borderRadius: 6,
        flex: 1,
    },
    formRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 20,
    },
    section: { marginBottom: 20 },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    button: {
        backgroundColor: "#3b82f6",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    buttonText: { color: "white", fontWeight: "bold" },
    smallButton: {
        backgroundColor: "#e5e7eb",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 6,
    },
    buttonRow: { flexDirection: "row" },
    emptyText: { color: "#9ca3af", fontStyle: "italic" },
});
