import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Expense } from '../../stores/expensesStore';

interface Props {
    expense: Expense;
    onPress?: () => void;
}

export default function ExpenseItem({
    expense,
    onPress,
}: Props) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.store}>{expense.store}</Text>
                <Text style={styles.amount}>{expense.amount.toFixed(2)} zł</Text>
                <Text style={styles.date}>{expense.date}</Text>
                <Text style={styles.category}>{expense.category}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    store: { flex: 1, fontWeight: '500' },
    amount: { flex: 1, },
    date: { flex: 1, },
    category: { flex: 1, },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
