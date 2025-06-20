// components/pantries/ItemList.tsx
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Item = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiry_date?: string | null;
};

type Props = {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onQuantityChange: (id: string, newQuantity: number) => void;
};

export default function ItemList({ items, onEdit, onDelete, onQuantityChange }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Produkt</Text>
        <Text style={styles.header}>Kategoria</Text>
        <Text style={styles.headerCenter}>Ilość</Text>
        <Text style={styles.headerActions}>Akcje</Text>
      </View>

      {items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.categoryText}>{item.category}</Text>
          <View style={styles.quantityBox}>
            <TouchableOpacity onPress={() => onQuantityChange(item.id, Math.max(0, item.quantity - 1))}>
              <Text style={styles.control}>➖</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity} {item.unit}</Text>
            <TouchableOpacity onPress={() => onQuantityChange(item.id, item.quantity + 1)}>
              <Text style={styles.control}>➕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionsBox}>
            <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
              <Text style={styles.edit}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionButton}>
              <Text style={styles.remove}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 8,
  },
  header: { flex: 1, fontWeight: 'bold', fontSize: 13 },
  headerCenter: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 13 },
  headerActions: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 13 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
  },
  productName: { flex: 1, fontSize: 16 },
  categoryText: { flex: 1, fontSize: 14, color: '#666', fontStyle: 'italic' },
  quantityBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  control: { fontSize: 18, color: '#0ea5e9' },
  quantityText: { fontSize: 15, minWidth: 50, textAlign: 'center' },
  actionsBox: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 12 },
  actionButton: { padding: 4 },
  edit: { color: '#0ea5e9', fontWeight: '600' },
  remove: { color: '#ef4444', fontWeight: '600' },
});
