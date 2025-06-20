// app/expenses/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import MemberList from "../../components/ui/MemberList";
import Select from "../../components/ui/Select";
import Toast from "../../components/ui/Toast";
import { supabase } from "../../lib/supabaseClient";
import { Member, useExpensesStore } from "../../stores/expensesStore";
import { useUserStore } from "../../stores/userStore";

const CATEGORIES = ["żywność", "samochód", "rozrywka", "chemia", "inne"];

export default function EditExpensePage() {
    const params = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useUserStore();
    const { expenses, updateExpense } = useExpensesStore();

    const [amount, setAmount] = useState(0);
    const [store, setStore] = useState("");
    const [date, setDate] = useState("");
    const [category, setCategory] = useState("");
    const [sharedWith, setSharedWith] = useState<Member[]>([]);
    const [toast, setToast] = useState<{ message: string; type?: "error" | "success" } | null>(null);

    useEffect(() => {
        if (!params.id || !user?.id) return;
        const found = expenses.find(e => e.id === params.id && e.user_id === user.id);
        if (!found) return;

        setAmount(found.amount);
        setStore(found.store);
        setDate(found.date);
        setCategory(found.category || "");

        (async () => {
            const { data: viewers } = await supabase
                .from("expense_viewers")
                .select("user_id")
                .eq("expense_id", id);
            const viewerIds = viewers?.map(v => v.user_id) || [];
            if (viewerIds.length) {
                const { data: users } = await supabase
                    .from("profiles")
                    .select("id, email")
                    .in("id", viewerIds);
                if (users) {
                    setSharedWith(users.map(u => ({ id: u.id, email: u.email, role: "viewer" })));
                }
            }
        })();
    }, [id, expenses, user]);

    const handleInvite = async (email: string) => {
        if (sharedWith.some(m => m.email === email)) {
            setToast({ message: "Użytkownik już dodany.", type: "error" });
            return;
        }
        const { data: profile, error } = await supabase
            .from("profiles")
            .select("id, email")
            .eq("email", email)
            .maybeSingle();
        if (!profile || error) {
            setToast({ message: "Nie znaleziono użytkownika.", type: "error" });
            return;
        }
        setSharedWith(prev => [...prev, { id: profile.id, email: profile.email, role: "viewer" }]);
    };

    const handleRemove = (memberId: string) => {
        setSharedWith(prev => prev.filter(m => m.id !== memberId));
    };

    const handleSave = async () => {
        if (!id || !user?.id || !store.trim() || !amount || !date || !category) {
            setToast({ message: "Wypełnij wszystkie pola.", type: "error" });
            return;
        }
        const result = await updateExpense(
            id,
            user.id,
            { amount, store: store.trim(), date, category },
            sharedWith
        );
        if (!result.success) {
            setToast({ message: result.error || "Błąd zapisu zmian.", type: "error" });
            return;
        }
        router.back();
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>✏️ Edytuj wydatek</Text>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <MemberList
                isOwner
                members={sharedWith}
                onInvite={handleInvite}
                onRemove={handleRemove}
            />

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
                options={CATEGORIES}
                onChange={setCategory}
            />

            <Button onPress={handleSave} variant="confirm">
                💾 Zapisz zmiany
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, gap: 16 },
    title: { fontSize: 20, fontWeight: "bold" },
});
