// app/expenses/new.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { supabase } from "../../lib/supabaseClient";
import { useExpensesStore } from "../../stores/expensesStore";
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

    const handleInvite = async (email: string) => {
        if (sharedWith.some((m) => m.email === email)) {
            return Alert.alert("Użytkownik już dodany.");
        }
        const { data: profile, error } = await supabase
            .from("profiles")
            .select("id, email")
            .eq("email", email)
            .maybeSingle();
        if (!profile || error) {
            return Alert.alert("Nie znaleziono użytkownika.");
        }
        setSharedWith((prev) => [
            ...prev,
            { id: profile.id, email: profile.email, role: "viewer" },
        ]);
    };

    const handleRemove = (id: string) => {
        setSharedWith((prev) => prev.filter((m) => m.id !== id));
    };

    const validateForm = () => {
        if (amount <= 0) return Alert.alert("Kwota musi być większa od zera.");
        if (!store.trim()) return Alert.alert("Sklep nie może być pusty.");
        if (new Date(date) > new Date()) return Alert.alert("Data nie może być z przyszłości.");
        if (!category) return Alert.alert("Wybierz kategorię.");
        return true;
    };

    const handleAdd = async () => {
        if (!validateForm() || !user?.id) return;
        const result = await addExpense(
            { amount, store: store.trim(), date, category, user_id: user.id },
            sharedWith
        );
        if (!result.success) {
            return Alert.alert(result.error || "Błąd zapisu wydatku.");
        }
        Alert.alert("Wydatek dodany!");
        router.push("/expenses");
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>💸 Nowy wydatek</Text>

            <Input
                label="Kwota (zł)"
                keyboardType="numeric"
                value={amount.toString()}
                onChangeText={(text) => setAmount(Number(text))}
            />

            <Input
                label="Sklep"
                value={store}
                onChangeText={setStore}
            />

            <Input
                label="Data"
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
            />

            <Select
                label="Kategoria"
                value={category}
                options={CATEGORIES}
                onChange={setCategory}
            />

            <Button onPress={handleAdd} variant="confirm">
                ➕ Dodaj wydatek
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, gap: 16 },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
});
