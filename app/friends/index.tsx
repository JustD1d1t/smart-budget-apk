// app/friends/index.tsx
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Toast from "../../components/ui/Toast";
import { useFriendsStore } from "../../stores/friendsStore";
import { useUserStore } from "../../stores/userStore";

export default function FriendsPage() {
    const { user } = useUserStore();
    const userId = user?.id ?? null;
    const { friends, fetchFriends, sendInvite, acceptInvite, removeFriend } = useFriendsStore();
    const [email, setEmail] = useState("");
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // helper to show toast and auto-dismiss
    const showToast = (message: string, type: 'success' | 'error' = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    const sent = friends.filter(f => f.requester_id === userId && f.status === "pending");
    const received = friends.filter(f => f.recipient_id === userId && f.status === "pending");
    const accepted = friends.filter(
        f => f.status === "accepted" && (f.requester_id === userId || f.recipient_id === userId)
    );

    const handleInvite = async () => {
        if (!email.trim()) {
            showToast("Podaj email", 'error');
            return;
        }
        const { success, error } = await sendInvite(email.trim());
        setEmail("");
        if (success) {
            showToast("Zaproszenie wysłane!", 'success');
            fetchFriends();
        } else {
            showToast(error || "Błąd przy wysyłaniu");
        }
    };

    const onAccept = async (id: string) => {
        const { success, error } = await acceptInvite(id);
        if (success) {
            showToast("Zaproszenie zaakceptowane!", 'success');
            fetchFriends();
        } else {
            showToast(error || "Błąd przy akceptowaniu");
        }
    };

    const onRemove = async (id: string) => {
        const { success, error } = await removeFriend(id);
        if (success) {
            showToast("Znajomy usunięty", 'success');
            fetchFriends();
        } else {
            showToast(error || "Błąd przy usuwaniu");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>👤 Znajomi</Text>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <View style={styles.formRow}>
                <View style={styles.inputWrapper}>
                    <Input
                        label="Email znajomego"
                        placeholder="adres email"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>
                <Button onPress={handleInvite} variant="confirm">Zaproś</Button>
            </View>

            {received.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.subHeader}>Otrzymane zaproszenia</Text>
                    {received.map(f => (
                        <View key={f.id} style={styles.row}>
                            <Text>{f.user_email}</Text>
                            <View style={styles.actionsRow}>
                                <Button size="sm" onPress={() => onAccept(f.id)}>Akceptuj</Button>
                                <Button size="sm" variant="danger" onPress={() => onRemove(f.id)}>Usuń</Button>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {sent.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.subHeader}>Wysłane zaproszenia</Text>
                    {sent.map(f => (
                        <View key={f.id} style={styles.row}>
                            <Text>{f.user_email}</Text>
                            <Button size="sm" variant="ghost" onPress={() => onRemove(f.id)}>Usuń</Button>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.subHeader}>Twoi znajomi</Text>
                {accepted.length === 0 ? (
                    <Text style={styles.empty}>Brak</Text>
                ) : (
                    accepted.map(f => (
                        <View key={f.id} style={styles.row}>
                            <Text>{f.user_email}</Text>
                            <Button size="sm" variant="ghost" onPress={() => onRemove(f.id)}>Usuń</Button>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
    formRow: { flexDirection: "row", gap: 8, alignItems: "flex-end", marginBottom: 20 },
    inputWrapper: { flex: 1 },
    section: { marginBottom: 20 },
    subHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    actionsRow: { flexDirection: "row", gap: 8 },
    empty: { color: "#9ca3af", fontStyle: "italic" },
});
