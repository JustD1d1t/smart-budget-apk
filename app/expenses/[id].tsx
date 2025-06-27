// app/expenses/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Toast from "../../components/ui/Toast";
import { productsDb } from '../../data/productsDb';
import { useExpensesStore } from "../../stores/expensesStore";
import { useUserStore } from "../../stores/userStore";

const CATEGORIES = Object.keys(productsDb);

export default function EditExpensePage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useUserStore();
    const { expenses, updateExpense, deleteExpense } = useExpensesStore();

    const [amount, setAmount] = useState(0);
    const [store, setStore] = useState("");
    const [date, setDate] = useState("");
    const [category, setCategory] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (!id || !user?.id) return;
        const found = expenses.find(e => e.id === id && e.user_id === user.id);
        if (found) {
            setAmount(found.amount);
            setStore(found.store);
            setDate(found.date);
            setCategory(found.category || "");
        }
    }, [id, expenses, user]);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async () => {
        if (!id || !user?.id || !store.trim() || !amount || !date || !category) {
            showToast("Wypełnij wszystkie pola.", "error");
            return;
        }
        const result = await updateExpense(
            id,
            user.id,
            { amount, store: store.trim(), date, category },
            []
        );
        if (!result.success) {
            showToast(result.error || "Błąd zapisu zmian.", "error");
            return;
        }
        router.back();
    };

    const handleDelete = async () => {
        if (!id || !user?.id) return;
        const result = await deleteExpense(id, user.id);
        if (!result.success) {
            showToast(result.error || "Błąd usuwania.", "error");
            return;
        }
        router.replace("..");
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {toast && <Toast message={toast.message} type={toast.type} />}

            <Text style={styles.title}>✏️ Edytuj wydatek</Text>

            <Input
                label="Kwota (zł)"
                keyboardType="numeric"
                value={amount.toString()}
                onChangeText={text => setAmount(Number(text))}
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
                options={CATEGORIES.map(c => ({ label: c, value: c }))}
                onChange={setCategory}
            />

            <View style={styles.buttonsRow}>
                <Button onPress={handleSave} variant="confirm">
                    💾 Zapisz zmiany
                </Button>
                <Button onPress={handleDelete} variant="danger">
                    🗑️ Usuń wydatek
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, gap: 12 },
    title: { fontSize: 20, fontWeight: "bold" },
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 16,
    },
});
