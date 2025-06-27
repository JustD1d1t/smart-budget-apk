// components/pantries/GroupedItemList.tsx

import { useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
export interface Item {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
}

type Props = {
    items: Item[];
    onEdit: (item: Item) => void;
    onDelete: (id: string) => void;
};

export default function GroupedItemList({ items, onEdit, onDelete }: Props) {
    const grouped = items.reduce<Record<string, Item[]>>((acc, item) => {
        acc[item.category] = acc[item.category] || [];
        acc[item.category].push(item);
        return acc;
    }, {});

    const [openCategory, setOpenCategory] = useState<string | null>(null);

    return (
        <View style={styles.container}>
            {Object.entries(grouped).map(([category, groupItems]) => (
                <View key={category} style={styles.groupBox}>
                    <TouchableOpacity
                        style={styles.groupHeader}
                        onPress={() =>
                            setOpenCategory((prev) => (prev === category ? null : category))
                        }
                    >
                        <Text style={styles.groupTitle}>
                            {category} ({groupItems.length})
                        </Text>
                    </TouchableOpacity>

                    {openCategory === category && (
                        <View style={styles.listBox}>
                            {groupItems.map((item) => (
                                <View key={item.id} style={styles.itemRow}>
                                    <Text style={styles.itemText}>{item.name}</Text>
                                    <Text style={styles.quantityText}>
                                        {item.quantity} {item.unit}
                                    </Text>
                                    <TouchableOpacity onPress={() => onEdit(item)}>
                                        <Text style={styles.actionEdit}>✏️</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => onDelete(item.id)}>
                                        <Text style={styles.actionDelete}>🗑</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 12 },
    groupBox: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        overflow: "hidden",
    },
    groupHeader: {
        backgroundColor: "#f3f4f6",
        padding: 12,
    },
    groupTitle: {
        fontWeight: "bold",
        fontSize: 16,
    },
    listBox: {
        paddingVertical: 4,
        backgroundColor: "white",
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    itemText: { flex: 1 },
    quantityText: { flex: 1, color: "#555" },
    actionEdit: { color: "#0ea5e9" },
    actionDelete: { color: "#ef4444" },
});
