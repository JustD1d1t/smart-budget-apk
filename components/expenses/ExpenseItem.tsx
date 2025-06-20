import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Expense } from '../../stores/expensesStore';
import Button from '../ui/Button';

interface Props {
    expense: Expense;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function ExpenseItem({
    expense,
    onPress,
    onEdit,
    onDelete,
}: Props) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.store}>{expense.store}</Text>
                <Text style={styles.amount}>{expense.amount.toFixed(2)} zł</Text>
                <Text style={styles.date}>{expense.date}</Text>
                <Text style={styles.category}>{expense.category}</Text>
            </View>
            <View style={styles.actions}>
                {onEdit && <Button onPress={onEdit}>✏️</Button>}
                {onDelete && <Button onPress={onDelete} variant="danger">🗑️</Button>}
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
        marginBottom: 8,
    },
    store: { flex: 1, fontWeight: '500' },
    amount: { width: 80, textAlign: 'right' },
    date: { width: 80, textAlign: 'right' },
    category: { width: 80, textAlign: 'right' },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
