// app/expenses/index.tsx
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ExpenseFilters from "../../components/expenses/ExpenseFilters";
import ExpenseItem from "../../components/expenses/ExpenseItem";
import Button from "../../components/ui/Button";
import { useExpensesStore } from "../../stores/expensesStore";
import { useUserStore } from "../../stores/userStore";

function formatDateLocal(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function getStartAndEndOfMonth(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start: formatDateLocal(start), end: formatDateLocal(end) };
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

    const [filtersOpen, setFiltersOpen] = useState(false);

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
                    return (
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    );
                case "date_desc":
                    return (
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );
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

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>📋 Lista wydatków</Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            onPress={() => setFiltersOpen(true)}
                            style={styles.filterButton}
                        >
                            <Text style={styles.filterIcon}>⚙️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push("/expenses/new")}
                            style={styles.filterButton}
                        >
                            <Text style={styles.filterIcon}>➕</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" />
                ) : (
                    <View style={styles.list}>
                        <View style={styles.columns}>
                            <Text style={styles.colText}>Sklep</Text>
                            <Text style={styles.colText}>Kwota</Text>
                            <Text style={styles.colText}>Data</Text>
                            <Text style={styles.colText}>Kategoria</Text>
                        </View>

                        {visibleExpenses.map((exp) => (
                            <ExpenseItem
                                key={exp.id}
                                expense={exp}
                                onPress={() => router.push(`/expenses/${exp.id}`)}
                            />
                        ))}

                        {visibleExpenses.length === 0 && (
                            <Text style={styles.empty}>Brak zapisanych wydatków.</Text>
                        )}
                    </View>
                )}
            </ScrollView>

            <Modal
                visible={filtersOpen}
                animationType="slide"
                onRequestClose={() => setFiltersOpen(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Filtry</Text>
                    <ExpenseFilters
                        filterCategory={filterCategory}
                        onFilterCategoryChange={setFilterCategory}
                        sortOption={sortOption}
                        onSortOptionChange={setSortOption}
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                    />
                    <Button
                        onPress={() => setFiltersOpen(false)}
                        variant="neutral"
                        style={styles.modalClose}
                    >
                        Zamknij
                    </Button>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, gap: 8 },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: { fontSize: 20, fontWeight: "bold" },
    filterButton: {
        padding: 6,
    },
    filterIcon: {
        fontSize: 24,
    },
    list: { gap: 8, marginTop: 12 },
    columns: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderColor: "#ccc",
    },
    colText: { flex: 1, fontWeight: "600", fontSize: 12 },
    empty: { color: "#888", marginTop: 20, textAlign: "center" },
    modalContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fafafa",
    },
    modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
    modalClose: { marginTop: 20 },
    headerButtons: { display: 'flex', flexDirection: 'row', gap: 8}
});
