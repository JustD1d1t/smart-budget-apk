// app/pantries/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text } from "react-native";
import AddPantryItemForm from "../../components/pantries/AddPantryItemForm";
import EditPantryItemModal from "../../components/pantries/EditPantryItemModal";
import GroupedItemList from "../../components/pantries/GroupedItemList";
import ItemList from "../../components/pantries/ItemList";
import Accordion from "../../components/ui/Accordion";
import MemberList from "../../components/ui/MemberList";
import Select from "../../components/ui/Select";
import Toast from "../../components/ui/Toast";
import { usePantriesStore } from "../../stores/pantriesStore";

export default function PantryDetailsPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [editingItem, setEditingItem] = useState<any>(null);
    const [filterCategory, setFilterCategory] = useState("all");
    const [sortBy, setSortBy] = useState<"name" | "category" | "expiry_date">("name");
    const [groupedView, setGroupedView] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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

    const handleInvite = async (memberId: string) => {
        const result = await inviteMember(id as string, memberId);
        setToast({ message: result.message, type: result.success ? "success" : "error" });
    };

    const handleRemove = async (memberId: string) => {
        await removeMember(id as string, memberId);
        setToast({ message: "Użytkownik usunięty.", type: "success" });
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

    const categories = ["all", ...new Set(pantryItems.map((item) => item.category))];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>📦 Szczegóły spiżarni: {selectedPantry?.name || ""}</Text>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {isOwner && (
                <MemberList
                    isOwner
                    members={pantryMembers}
                    onInvite={handleInvite}
                    onRemove={handleRemove}
                />
            )}

            <AddPantryItemForm pantryId={id as string} onItemAdded={() => fetchPantryItems(id as string)} />

            <Accordion
                title={groupedView ? "Pokaż jako listę" : "Pogrupuj po kategoriach"}
                expanded
                onToggle={() => setGroupedView(!groupedView)}
            />

            <Select
                label="Kategoria"
                value={filterCategory}
                options={categories}
                onChange={setFilterCategory}
            />

            {!groupedView && (
                <Select
                    label="Sortuj po"
                    value={sortBy}
                    options={["name", "category", "expiry_date"]}
                    onChange={setSortBy}
                />
            )}

            {loading ? (
                <ActivityIndicator style={styles.loader} />
            ) : filteredItems.length === 0 ? (
                <Text style={styles.empty}>Brak produktów</Text>
            ) : groupedView ? (
                <GroupedItemList items={filteredItems} onEdit={setEditingItem} onDelete={handleDeleteItem} />
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
    loader: { marginVertical: 20 },
    empty: { textAlign: "center", color: "#888", marginVertical: 20 },
});
