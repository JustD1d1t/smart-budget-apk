// app/pantries/[id].tsx

import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Picker,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { showMessage } from "react-native-flash-message";
import AddPantryItemForm from "../../components/pantries/AddPantryItemForm";
import EditPantryItemModal from "../../components/pantries/EditPantryItemModal";
import GroupedItemList from "../../components/pantries/GroupedItemList";
import ItemList from "../../components/pantries/ItemList";
import MemberList from "../../components/ui/MemberList";
import { usePantriesStore } from "../../stores/pantriesStore";

export default function PantryDetailsPage() {
    const { id } = useLocalSearchParams();
    const [editingItem, setEditingItem] = useState(null);
    const [filterCategory, setFilterCategory] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [groupedView, setGroupedView] = useState(false);

    const {
        selectedPantry,
        isOwner,
        pantryItems,
        pantryMembers,
        loading,
        fetchPantryDetails,
        fetchPantryItems,
        fetchPantryMembers,
        updatePantryItem,
        deletePantryItem,
        updateItemQuantity,
        inviteMember,
        removeMember,
        addPantryItem,
    } = usePantriesStore();

    useEffect(() => {
        if (id) {
            fetchPantryDetails(id);
            fetchPantryItems(id);
            fetchPantryMembers(id);
        }
    }, [id]);

    const handleSaveEdit = async () => {
        if (!editingItem) return;
        await updatePantryItem(editingItem);
        setEditingItem(null);
    };

    const handleDeleteItem = async (itemId: string) => {
        await deletePantryItem(itemId);
    };

    const handleQuantityChange = async (itemId: string, newQuantity: number) => {
        await updateItemQuantity(itemId, newQuantity);
    };

    const handleInvite = async (email: string) => {
        const result = await inviteMember(id, email);
        showMessage({ message: result.message, type: result.success ? "success" : "danger" });
    };

    const handleRemove = async (memberId: string) => {
        await removeMember(memberId);
        showMessage({ message: "Użytkownik usunięty.", type: "success" });
    };

    const filteredItems = pantryItems
        .filter((item) => filterCategory === "all" || item.category === filterCategory)
        .sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "category") return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
            if (sortBy === "expiry_date") {
                const dateA = a.expiry_date ? new Date(a.expiry_date).getTime() : Infinity;
                const dateB = b.expiry_date ? new Date(b.expiry_date).getTime() : Infinity;
                return dateA - dateB;
            }
            return 0;
        });

    const categories = [...new Set(pantryItems.map((item) => item.category))];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>📦 Szczegóły spiżarni: {selectedPantry?.name || ""}</Text>

            {isOwner && (
                <MemberList
                    isOwner={true}
                    members={pantryMembers}
                    onInvite={handleInvite}
                    onRemove={handleRemove}
                />
            )}

            <AddPantryItemForm pantryId={id as string} onItemAdded={() => fetchPantryItems(id)} />

            <View style={styles.controls}>
                <TouchableOpacity onPress={() => setGroupedView(!groupedView)} style={styles.switchButton}>
                    <Text>{groupedView ? "Pokaż jako listę" : "Pogrupuj po kategoriach"}</Text>
                </TouchableOpacity>

                <Picker selectedValue={filterCategory} onValueChange={(v) => setFilterCategory(v)} style={styles.picker}>
                    <Picker.Item label="Wszystkie kategorie" value="all" />
                    {categories.map((cat) => (
                        <Picker.Item key={cat} label={cat} value={cat} />
                    ))}
                </Picker>

                {!groupedView && (
                    <Picker selectedValue={sortBy} onValueChange={(v) => setSortBy(v)} style={styles.picker}>
                        <Picker.Item label="Sortuj alfabetycznie" value="name" />
                        <Picker.Item label="Sortuj po kategorii" value="category" />
                        <Picker.Item label="Sortuj po dacie przydatności" value="expiry_date" />
                    </Picker>
                )}
            </View>

            {loading ? (
                <ActivityIndicator />
            ) : filteredItems.length === 0 ? (
                <Text>Brak produktów</Text>
            ) : groupedView ? (
                <GroupedItemList
                    items={filteredItems}
                    onEdit={setEditingItem}
                    onDelete={handleDeleteItem}
                />
            ) : (
                <ItemList
                    items={filteredItems}
                    onEdit={setEditingItem}
                    onDelete={handleDeleteItem}
                    onQuantityChange={handleQuantityChange}
                />
            )}

            {editingItem && (
                <EditPantryItemModal
                    item={editingItem}
                    onChange={setEditingItem}
                    onClose={() => setEditingItem(null)}
                    onSave={handleSaveEdit}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
    controls: { gap: 12, marginVertical: 12 },
    switchButton: {
        backgroundColor: "#e5e7eb",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    picker: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
    },
});