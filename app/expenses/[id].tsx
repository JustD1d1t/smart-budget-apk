import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import ExpenseFilters from "../../components/expenses/ExpenseFilters";
import ExpenseItem from "../../components/expenses/ExpenseItem";
import MemberList from "../../components/ui/MemberList";
import { supabase } from "../../lib/supabaseClient";
import { Member, useExpensesStore } from "../../stores/expensesStore";
import { useUserStore } from "../../stores/userStore";

const CATEGORIES = ["żywność", "samochód", "rozrywka", "chemia", "inne"];

export default function EditExpensePage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const navigation = useNavigation();
    const { user } = useUserStore();
    const { expenses, updateExpense } = useExpensesStore();

    const [amount, setAmount] = useState(0);
    const [store, setStore] = useState("");
    const [date, setDate] = useState("");
    const [category, setCategory] = useState("");
    const [sharedWith, setSharedWith] = useState<Member[]>([]);

    useEffect(() => {
        if (!id) return;
        const found = expenses.find((e) => e.id === id && e.user_id === user?.id);
        if (!found) return;

        setAmount(found.amount);
        setStore(found.store);
        setDate(found.date);
        setCategory(found.category || "");

        const fetchViewers = async () => {
            const { data: viewers } = await supabase
                .from("expense_viewers")
                .select("user_id")
                .eq("expense_id", id);

            const viewerIds = viewers?.map((v) => v.user_id) || [];

            if (viewerIds.length > 0) {
                const { data: users } = await supabase
                    .from("profiles")
                    .select("id, email")
                    .in("id", viewerIds);

                if (users) {
                    setSharedWith(
                        users.map((u) => ({ id: u.id, email: u.email, role: "viewer" }))
                    );
                }
            }
        };

        fetchViewers();
    }, [id, expenses, user?.id]);

    const handleInvite = async (email: string) => {
        const alreadyAdded = sharedWith.some((m) => m.email === email);
        if (alreadyAdded) {
            Alert.alert("Użytkownik już dodany.");
            return;
        }

        const { data: userData, error } = await supabase
            .from("profiles")
            .select("id, email")
            .eq("email", email)
            .maybeSingle();

        if (!userData || error) {
            Alert.alert("Nie znaleziono użytkownika.");
            return;
        }

        setSharedWith((prev) => [
            ...prev,
            { id: userData.id, email: userData.email, role: "viewer" },
        ]);
    };

    const handleRemove = (id: string) => {
        setSharedWith((prev) => prev.filter((m) => m.id !== id));
    };

    const handleSave = async () => {
        if (!id || !user?.id || !store.trim() || !amount || !date || !category) {
            Alert.alert("Wypełnij wszystkie pola.");
            return;
        }

        const result = await updateExpense(
            id,
            user.id,
            { amount, store: store.trim(), date, category },
            sharedWith
        );

        if (!result.success) {
            Alert.alert(result.error || "Błąd zapisu zmian.");
            return;
        }

        navigation.goBack();
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>✏️ Edytuj wydatek</Text>

            <MemberList
                isOwner={true}
                members={sharedWith}
                onInvite={handleInvite}
                onRemove={handleRemove}
            />

            <ExpenseItem
                amount={amount}
                store={store}
                onAmountChange={setAmount}
                onStoreChange={setStore}
            />

            <ExpenseFilters
                date={date}
                category={category}
                onDateChange={setDate}
                onCategoryChange={setCategory}
                categories={CATEGORIES}
            />

            <View style={styles.buttonWrapper}>
                <Button title="💾 Zapisz zmiany" onPress={handleSave} />
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
    },
    buttonWrapper: {
        marginTop: 12,
    },
});
