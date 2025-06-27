import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { ShoppingItem } from "../../stores/shoppingListStore";


interface Props {
    items: ShoppingItem[];
    onToggle: (itemId: string, current: boolean) => void;
    onEdit: (item: ShoppingItem) => void;
}

export default function ItemList({ items, onToggle, onEdit }: Props) {
    return (
        <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
                <View style={styles.row}>
                    <Pressable
                        onPress={() => onToggle(item.id, item.bought)}
                        style={styles.left}
                    >
                        <Text style={item.bought ? styles.boughtText : styles.text}>
                            ✅ {item.name} ({item.category}) - {item.quantity} {item.unit}
                            {item.recipe ? ` (${item.recipe})` : ""}
                        </Text>
                    </Pressable>

                    <Pressable onPress={() => onEdit(item)}>
                        <Text style={styles.edit}>Edytuj</Text>
                    </Pressable>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        gap: 8,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderColor: "#ccc",
    },
    left: {
        flex: 1,
        marginRight: 12,
    },
    text: {
        fontSize: 16,
    },
    boughtText: {
        fontSize: 16,
        textDecorationLine: "line-through",
        color: "#888",
    },
    edit: {
        fontSize: 14,
        color: "#2563eb",
    },
});
