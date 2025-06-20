import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import ExpenseFilters from "../../components/expenses/ExpenseFilters";
import ExpenseItem from "../../components/expenses/ExpenseItem";
import { useExpensesStore } from "../../stores/expensesStore";
import { useUserStore } from "../../stores/userStore";

const CATEGORIES = ["", "żywność", "samochód", "rozrywka", "chemia", "inne"];
const SORT_OPTIONS = [
    { label: "Kategoria (A-Z)", value: "category_asc" },
    { label: "Kategoria (Z-A)", value: "category_desc" },
    { label: "Data (najnowsze)", value: "date_desc" },
    { label: "Data (najstarsze)", value: "date_asc" },
    { label: "Kwota (rosnąco)", value: "amount_asc" },
    { label: "Kwota (malejąco)", value: "amount_desc" },
];

function formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getStartAndEndOfMonth(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
        start: formatDateLocal(start),
        end: formatDateLocal(end),
    };
}

export default function ExpensesListPage() {
    const { user } = useUserStore();
    const { expenses, fetchExpenses, deleteExpense, loading } = useExpensesStore();
    const router = useRouter();

    const [filterCategory, setFilterCategory] = useState("");
    const [sortOption, setSortOption] = useState("date_desc");

    const { start, end } = getStartAndEndOfMonth(new Date());
    const [startDate, setStartDate] = useState(start);
    const [endDate, setEndDate] = useState(end);

    useEffect(() => {
        if (user?.id) {
            fetchExpenses(user.id, startDate, endDate);
        }
    }, [user?.id, startDate, endDate]);

    const visibleExpenses = useMemo(() => {
        const filtered = filterCategory
            ? expenses.filter((e) => e.category === filterCategory)
            : expenses;

        return [...filtered].sort((a, b) => {
            switch (sortOption) {
                case "category_asc":
                    return (a.category || "").localeCompare(b.category || "");
                case "category_desc":
                    return (b.category || "").localeCompare(a.category || "");
                case "date_asc":
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case "date_desc":
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case "amount_asc":
                    return a.amount - b.amount;
                case "amount_desc":
                    return b.amount - a.amount;
                default:
                    return 0;
            }
        });
    }, [expenses, filterCategory, sortOption]);

    const handleDelete = async (id: string) => {
        if (!user?.id) return;
        await deleteExpense(id, user.id);
    };

    const handleEdit = (id: string) => {
        router.push(`/expenses/edit/${id}`);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>📋 Lista wydatków</Text>

            <ExpenseFilters
                filterCategory={filterCategory}
                onFilterCategoryChange={setFilterCategory}
                sortOption={sortOption}
                onSortOptionChange={setSortOption}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                categories={CATEGORIES}
                sortOptions={SORT_OPTIONS}
            />

            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <View style={styles.list}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Sklep</Text>
                        <Text style={styles.headerText}>Kwota</Text>
                        <Text style={styles.headerText}>Data</Text>
                        <Text style={styles.headerText}>Kategoria</Text>
                    </View>

                    {visibleExpenses.map((exp) => (
                        <ExpenseItem
                            key={exp.id}
                            expense={exp}
                            onEdit={exp.user_id === user?.id ? handleEdit : undefined}
                            onDelete={exp.user_id === user?.id ? handleDelete : undefined}
                        />
                    ))}

                    {visibleExpenses.length === 0 && (
                        <Text style={styles.empty}>Brak zapisanych wydatków.</Text>
                    )}
                </View>
            )}

            <View style={styles.buttonWrapper}>
                <Button title="➕ Dodaj nowy wydatek" onPress={() => router.push("/expenses/new")} />
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
    list: {
        gap: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderColor: "#ccc",
    },
    headerText: {
        flex: 1,
        fontWeight: "600",
        fontSize: 12,
    },
    empty: {
        color: "#888",
        marginTop: 16,
    },
    buttonWrapper: {
        marginTop: 20,
    },
});
