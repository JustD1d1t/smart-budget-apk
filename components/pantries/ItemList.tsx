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
      </View>

      {items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          {/* Produkt */}
          <View style={styles.flex1}>
            <Text style={styles.productName}>{item.name}</Text>
            {item.expiry_date && (
              <Text style={styles.expiry}>Do: {item.expiry_date}</Text>
            )}
          </View>

          {/* Kategoria */}
          <View style={styles.flex1}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>

          {/* Ilość z +/- */}
          <View style={styles.quantityBox}>
            <TouchableOpacity onPress={() => onQuantityChange(item.id, Math.max(0, item.quantity - 1))}>
              <Text style={styles.control}>➖</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>
              {item.quantity} {item.unit}
            </Text>
            <TouchableOpacity onPress={() => onQuantityChange(item.id, item.quantity + 1)}>
              <Text style={styles.control}>➕</Text>
            </TouchableOpacity>
          </View>

          {/* Edytuj / Usuń */}
          <View style={styles.actionsBox}>
            <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
              <Text style={styles.edit}>✏️ Edytuj</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionButton}>
              <Text style={styles.remove}>🗑 Usuń</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  header: { fontWeight: "bold", flex: 1, fontSize: 13 },
  headerCenter: { fontWeight: "bold", textAlign: "center", flex: 1, fontSize: 13 },
  itemRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
    marginBottom: 12,
  },
  flex1: { flex: 1 },
  productName: { fontSize: 16 },
  expiry: { fontSize: 12, color: "#888" },
  categoryText: { fontSize: 14, color: "#666", fontStyle: "italic" },
  quantityBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  control: {
    fontSize: 18,
    color: "#0ea5e9",
    paddingHorizontal: 8,
  },
  quantityText: {
    fontSize: 15,
    color: "#111",
    minWidth: 60,
    textAlign: "center",
  },
  actionsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  edit: { color: "#0ea5e9", fontWeight: "600" },
  remove: { color: "#ef4444", fontWeight: "600" },
});
