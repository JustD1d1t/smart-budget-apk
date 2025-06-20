import React, { useState } from "react";
import {
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Collapsible from "react-native-collapsible";

interface ShoppingItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    bought: boolean;
}

interface Props {
    items: ShoppingItem[];
    filterCategory: string;
    onToggle: (itemId: string, current: boolean) => void;
    onEdit: (item: ShoppingItem) => void;
}

export default function GroupedItemList({
    items,
    filterCategory,
    onToggle,
    onEdit,
}: Props) {
    const categories = [...new Set(items.map((item) => item.category))];
    const [activeSections, setActiveSections] = useState<string[]>([]);

    const toggleSection = (category: string) => {
        setActiveSections((prev) =>
            prev.includes(category)
                ? prev.filter((cat) => cat !== category)
                : [...prev, category]
        );
    };

    return (
        <View>
            {categories
                .filter((cat) => filterCategory === "all" || cat === filterCategory)
                .map((cat) => {
                    const isOpen = activeSections.includes(cat);
                    const categoryItems = items.filter((item) => item.category === cat);

                    return (
                        <View key={cat} style={styles.accordionSection}>
                            <TouchableOpacity onPress={() => toggleSection(cat)} style={styles.accordionHeader}>
                                <Text style={styles.accordionTitle}>{cat}</Text>
                            </TouchableOpacity>

                            <Collapsible collapsed={!isOpen}>
                                {categoryItems.map((item) => (
                                    <View key={item.id} style={styles.itemRow}>
                                        <TouchableOpacity
                                            style={styles.itemInfo}
                                            onPress={() => onToggle(item.id, item.bought)}
                                        >
                                            <Switch value={item.bought} disabled />
                                            <Text style={[styles.itemText, item.bought && styles.itemBought]}>
                                                {item.name} ({item.quantity} {item.unit})
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => onEdit(item)}>
                                            <Text style={styles.editText}>Edytuj</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </Collapsible>
                        </View>
                    );
                })}
        </View>
    );
}

const styles = StyleSheet.create({
    accordionSection: {
        marginBottom: 12,
    },
    accordionHeader: {
        backgroundColor: "#e5e7eb",
        padding: 12,
        borderRadius: 8,
    },
    accordionTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    itemInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flex: 1,
    },
    itemText: {
        fontSize: 14,
    },
    itemBought: {
        textDecorationLine: "line-through",
        color: "#6b7280",
    },
    editText: {
        fontSize: 14,
        color: "#3b82f6",
    },
});
