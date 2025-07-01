// app/(pages)/expenses/New.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select, { SelectOption } from "../../components/ui/Select";
import Toast from "../../components/ui/Toast";
import { productsDb } from '../../data/productsDb';
import { useExpensesStore } from "../../stores/expensesStore";
import { useUserStore } from "../../stores/userStore";

const CATEGORIES: SelectOption[] = Object.keys(productsDb).map(cat => ({ label: cat, value: cat }));

type FormErrors = {
    amount?: string;
    store?: string;
    date?: string;
    category?: string;
};

export default function ExpensesNewPage() {
    const { user } = useUserStore();
    const { addExpense } = useExpensesStore();
    const router = useRouter();

    // Przechowujemy jako string z dwoma miejscami po przecinku
    const [amount, setAmount] = useState("");
    const [store, setStore] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [category, setCategory] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const validateForm = (): boolean => {
        const errs: FormErrors = {};
        const num = parseFloat(amount);
        if (isNaN(num) || num <= 0) errs.amount = "Kwota musi być większa od zera.";
        if (!store.trim()) errs.store = "Sklep nie może być pusty.";
        if (new Date(date) > new Date()) errs.date = "Data nie może być z przyszłości.";
        if (!category) errs.category = "Wybierz kategorię.";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleAdd = async () => {
        if (!validateForm() || !user?.id) return;
        const num = parseFloat(amount);
        const result = await addExpense(
            { amount: num, store: store.trim(), date, category, user_id: user.id }
        );
        if (!result.success) {
            showToast(result.error || "Błąd zapisu wydatku.", 'error');
            return;
        }
        showToast("Wydatek dodany!", 'success');
        router.push("/expenses");
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {toast && <Toast message={toast.message} type={toast.type} />}
            <Text style={styles.title}>💸 Nowy wydatek</Text>

            <Input
                label="Kwota (zł)"
                type="number"
                value={amount}
                onChangeText={setAmount}
                error={errors.amount}
            />

            <Input
                label="Sklep"
                value={store}
                onChangeText={setStore}
                error={errors.store}
            />

            <Input
                label="Data"
                type="date"
                value={date}
                onChangeText={setDate}
                error={errors.date}
                maximumDate={new Date()}
            />

            <Select
                label="Kategoria"
                value={category}
                options={CATEGORIES}
                onChange={setCategory}
                error={errors.category}
            />

            <Button onPress={handleAdd} variant="confirm">
                ➕ Dodaj wydatek
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, gap: 8 },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
});
