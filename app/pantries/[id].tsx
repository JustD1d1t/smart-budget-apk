// app/pantries/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text } from "react-native";
import AddPantryItemForm from "../../components/pantries/AddPantryItemForm";
import EditPantryItemModal from "../../components/pantries/EditPantryItemModal";
import GroupedItemList from "../../components/pantries/GroupedItemList";
import ItemList from "../../components/pantries/ItemList";
import Accordion from "../../components/ui/Accordion";
import MemberList from '../../components/ui/MemberList';
import Select from "../../components/ui/Select";
import Toast from "../../components/ui/Toast";
import { supabase } from '../../lib/supabaseClient';
import { usePantriesStore } from "../../stores/pantriesStore";

type Viewer = { id: string; email: string; role: 'owner' | 'member' };

export default function PantryDetailsPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [editingItem, setEditingItem] = useState<any>(null);
    const [filterCategory, setFilterCategory] = useState("all");
    const [sortBy, setSortBy] = useState<"name" | "category" | "expiry_date">("name");
    const [groupedView, setGroupedView] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [members, setMembers] = useState<Viewer[]>([]);
    const [membersLoading, setMembersLoading] = useState(true);

    const {
        selectedPantry,
        pantryItems,
        loading,
        fetchPantryDetails,
        fetchPantryItems,
        updatePantryItem,
        deletePantryItem,
        updateItemQuantity,
    } = usePantriesStore();

    useEffect(() => {
        if (id) {
            fetchPantryDetails(id);
            fetchPantryItems(id);
            fetchMembers();
        }
    }, [id]);


    const fetchMembers = async () => {
        setMembersLoading(true);
        const { data, error } = await supabase
            .from('pantry_members')
            .select('id, email, role')
            .eq('pantry_id', id);
        if (error) {
            Alert.alert('Błąd', 'Nie udało się pobrać współtwórców');
        } else if (data) {
            setMembers(data.map(m => ({ id: m.id, email: m.email, role: m.role })));
        }
        setMembersLoading(false);
    };



    const addShoppingListMember = async (friendEmail: string) => {
        if (!id) return;

        const { data: userData, error: userErr } = await supabase
            .from('users')
            .select('id')
            .eq('email', friendEmail)
            .limit(1)
            .single();

        if (userErr || !userData) {
            Alert.alert('Błąd', 'Nie znaleziono użytkownika o podanym e-mailu.');
            return;
        }
        const userId = userData.id;

        const { data: existing, error: checkErr } = await supabase
            .from('pantry_members')
            .select('id')
            .eq('pantry_id', id)
            .eq('user_id', userId);

        if (checkErr) {
            Alert.alert('Błąd', 'Nie udało się sprawdzić współtwórców.');
            return;
        }
        if (existing && existing.length > 0) {
            Alert.alert('Użytkownik jest już współtwórcą tej listy.');
            return;
        }

        const { error: insertErr } = await supabase
            .from('pantry_members')
            .insert({
                pantry_id: id,
                user_id: userId,
                email: friendEmail,
                role: 'member',
            });

        if (insertErr) {
            Alert.alert('Błąd', 'Nie udało się dodać współtwórcy.');
        } else {
            fetchMembers();
        }
    }

    const removeShoppingListMember = async (friendEmail: string): Promise<void> => {
        if (!id) return;

        // 1. Pobierz user_id po e-mailu
        const { data: userData, error: userErr } = await supabase
            .from('users')
            .select('id')
            .eq('email', friendEmail)
            .limit(1)
            .single();

        if (userErr || !userData) {
            Alert.alert('Błąd', 'Nie znaleziono użytkownika o podanym e-mailu.');
            return;
        }
        const userId = userData.id;

        // 2. Sprawdź, czy jest współtwórcą
        const { data: existing, error: checkErr } = await supabase
            .from('pantry_members')
            .select('id')
            .eq('pantry_id', id)
            .eq('user_id', userId);

        if (checkErr) {
            Alert.alert('Błąd', 'Nie udało się sprawdzić współtwórców.');
            return;
        }
        if (!existing || existing.length === 0) {
            Alert.alert('Użytkownik nie jest współtwórcą tej listy.');
            return;
        }

        // 3. Usuń wpis
        const { error: deleteErr } = await supabase
            .from('pantry_members')
            .delete()
            .eq('pantry_id', id)
            .eq('user_id', userId);

        if (deleteErr) {
            Alert.alert('Błąd', 'Nie udało się usunąć współtwórcy.');
        } else {
            // 4. Odśwież listę współtwórców
            fetchMembers();
        }
    };

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
            {membersLoading ? (
                <Text>Ładowanie współtwórców...</Text>
            ) : (
                <MemberList members={members} onAddFriend={addShoppingListMember} onRemoveFriend={removeShoppingListMember} />
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
