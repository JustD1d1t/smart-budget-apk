import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Button,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import MemberList from "../../components/ui/MemberList";
import { supabase } from "../../lib/supabaseClient";
import { Member, useExpensesStore } from "../../stores/expensesStore";
import { useUserStore } from "../../stores/userStore";

const CATEGORIES = ["żywność", "samochód", "rozrywka", "chemia", "inne"];

export default function ExpensesNewPage() {
    const { user } = useUserStore();
    const { addExpense } = useExpensesStore();
    const router = useRouter();

    const [amount, setAmount] = useState(0);
    const [store, setStore] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [category, setCategory] = useState("");
    const [sharedWith, setSharedWith] = useState<Member[]>([]);

    const handleInvite = async (email: string) => {
        const alreadyAdded = sharedWith.some((m) => m.email === email);
        if (alreadyAdded) {
            Alert.alert("Użytkownik już dodany.");
            return;
        }

        const { data: profile, error } = await supabase
            .from("profiles")
            .select("id, email")
            .eq("email", email)
            .maybeSingle();

        if (!profile || error) {
            Alert.alert("Nie znaleziono użytkownika.");
            return;
        }

        setSharedWith((prev) => [
            ...prev,
            { id: profile.id, email: profile.email, role: "viewer" },
        ]);
    };

    const handleRemove = (id: string) => {
        setSharedWith((prev) => prev.filter((m) => m.id !== id));
    };

    const validateForm = (): boolean => {
        if (!amount || amount <= 0) {
            Alert.alert("Kwota musi być większa od zera.");
            return false;
        }
        if (!store.trim()) {
            Alert.alert("Sklep nie może być pusty.");
            return false;
        }
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (selectedDate > today) {
            Alert.alert("Data nie może być z przyszłości.");
            return false;
        }
        if (!category) {
            Alert.alert("Wybierz kategorię.");
            return false;
        }
        return true;
    };

    const handleAdd = async () => {
        if (!validateForm() || !user?.id) return;

        const result = await addExpense(
            {
                amount,
                store: store.trim(),
                date,
                category,
                user_id: user.id,
            },
            sharedWith
        );

        if (!result.success) {
            Alert.alert(result.error || "Błąd zapisu wydatku.");
            return;
        }

        Alert.alert("Wydatek dodany!");
        router.push("/expenses");
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>💸 Nowy wydatek</Text>

            <MemberList
                isOwner={true}
                members={sharedWith}
                onInvite={handleInvite}
                onRemove={handleRemove}
            />

            <Text style={styles.label}>Kwota (zł)</Text>
            <TextInput
                value={amount.toString()}
                onChangeText={(text) => setAmount(Number(text))}
                keyboardType="numeric"
                style={styles.input}
            />

            <Text style={styles.label}>Sklep</Text>
            <TextInput
                value={store}
                onChangeText={setStore}
                style={styles.input}
            />

            <Text style={styles.label}>Data</Text>
            <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                style={styles.input}
            />

            <Text style={styles.label}>Kategoria</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={category}
                    onValueChange={(value) => setCategory(value)}
                >
                    <Picker.Item label="-- wybierz kategorię --" value="" />
                    {CATEGORIES.map((cat) => (
                        <Picker.Item key={cat} label={cat} value={cat} />
                    ))}
                </Picker>
            </View>

            <View style={styles.buttonWrapper}>
                <Button title="➕ Dodaj wydatek" onPress={handleAdd} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#f9f9f9",
        marginBottom: 12,
        ...Platform.select({
            android: {
                paddingHorizontal: 6,
            },
        }),
    },
    buttonWrapper: {
        marginTop: 20,
    },
});
