import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Expense {
    id: string;
    store: string;
    amount: number;
    date: string;       // format YYYY-MM-DD
    category: string;
    user_id: string;
}

type Props = {
    expense: Expense;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
};

export default function ExpenseItem({ expense, onEdit, onDelete }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.text}>{expense.store}</Text>
                <Text style={styles.amount}>{expense.amount.toFixed(2)} zł</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.date}>{expense.date}</Text>
                <Text style={styles.category}>{expense.category}</Text>
            </View>

            {(onEdit || onDelete) && (
                <View style={styles.actions}>
                    {onEdit && (
                        <TouchableOpacity onPress={() => onEdit(expense.id)} style={styles.button}>
                            <Text style={styles.buttonText}>✏️ Edytuj</Text>
                        </TouchableOpacity>
                    )}
                    {onDelete && (
                        <TouchableOpacity onPress={() => onDelete(expense.id)} style={styles.button}>
                            <Text style={styles.buttonText}>🗑 Usuń</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        paddingVertical: 12,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    text: {
        fontSize: 14,
        fontWeight: "500",
    },
    amount: {
        fontSize: 14,
        color: "#111827",
    },
    date: {
        fontSize: 12,
        color: "#6b7280",
    },
    category: {
        fontSize: 12,
        fontStyle: "italic",
        color: "#9ca3af",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
        marginTop: 8,
    },
    button: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: "#e5e7eb",
        borderRadius: 6,
    },
    buttonText: {
        fontSize: 12,
        color: "#111827",
    },
});
