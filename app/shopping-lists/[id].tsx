// app/shopping-lists/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AddItemForm from '../../components/shopping-list/AddItemForm';
import EditItemModal from '../../components/shopping-list/EditItemModal';
import GroupedItemList from '../../components/shopping-list/GroupedItemList';
import ItemList from '../../components/shopping-list/ItemList';
import PantrySelectModal from '../../components/shopping-list/PantrySelectModal';
import Button from '../../components/ui/Button';
import MemberList from '../../components/ui/MemberList';
import Select from '../../components/ui/Select';
import Toast from '../../components/ui/Toast';
import { useShoppingListStore } from '../../stores/shoppingListStore';

export default function ShoppingListDetailsPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'name' | 'category'>('name');
    const [groupedView, setGroupedView] = useState(false);
    const [showPantryModal, setShowPantryModal] = useState(false);
    const [pantries, setPantries] = useState<{ id: string; name: string }[]>([]);

    const {
        selectedList,
        items,
        fetchListDetails,
        fetchListItems,
        members,
        membersLoading,
        fetchMembers,
        addMember,
        removeMember,
        toggleItem,
        editItem,
        deleteBoughtItems,
        fetchLists,
        moveBoughtToPantry,
        addItem
    } = useShoppingListStore();

    useEffect(() => {
        if (id) {
            fetchListDetails(id);
            fetchListItems(id);
            fetchMembers(id);
            fetchLists();
        }
    }, [id]);

    const handleSaveEdit = async () => {
        if (!editingItem) return;
        await editItem(editingItem);
        setEditingItem(null);
    };

    const handleSelectPantry = async (pantryId: string) => {
        const { success, error } = await moveBoughtToPantry(pantryId);
        if (success) Toast({ message: 'Przeniesiono do spiżarni', type: 'success' });
        else Toast({ message: error || 'Błąd przenoszenia', type: 'error' });
        setShowPantryModal(false);
    };

    const handleAddItem = (item: any) => {
        addItem(item);
    };

    const addShoppingListMember = async (friendEmail: string) => {
        if (!id) return;
        const { success, error } = await addMember(id, friendEmail);
        if (!success) Toast({ message: error!, type: 'error' });
    };

    const removeShoppingListMember = async (friendEmail: string) => {
        if (!id) return;
        const { success, error } = await removeMember(id, friendEmail);
        if (!success) Toast({ message: error!, type: 'error' });
    };

    const filteredItems = items
        .filter(item => filterCategory === 'all' || item.category === filterCategory)
        .sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name) : a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    const categories = Array.from(new Set(items.map(i => i.category)));

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{selectedList?.name}</Text>
            {membersLoading ? <ActivityIndicator /> : <MemberList members={members} onAddFriend={addShoppingListMember} onRemoveFriend={removeShoppingListMember} />}
            <AddItemForm listId={id!} onItemAdded={handleAddItem} />
            <View style={styles.filters}>
                <Button onPress={() => setGroupedView(!groupedView)} variant="neutral">
                    {groupedView ? 'Lista' : 'Kategorie'}
                </Button>
                <Select label="Filtruj" value={filterCategory} options={['all', ...categories]} onChange={setFilterCategory} />
            </View>
            {filteredItems.length === 0 ? <Text style={styles.empty}>Brak produktów</Text> : groupedView ?
                <GroupedItemList items={filteredItems} onToggle={toggleItem} onEdit={setEditingItem} /> :
                <ItemList items={filteredItems} onToggle={toggleItem} onEdit={setEditingItem} />
            }
            {filteredItems.length > 0 && <View style={styles.actions}>
                <Button onPress={deleteBoughtItems} variant="danger">Usuń kupione</Button>
                <Button onPress={() => setShowPantryModal(true)} variant="confirm">Przenieś do spiżarni</Button>
            </View>}
            {editingItem && <EditItemModal item={editingItem} onChange={setEditingItem} onClose={() => setEditingItem(null)} onSave={handleSaveEdit} />}
            <PantrySelectModal isOpen={showPantryModal} onClose={() => setShowPantryModal(false)} onSelect={handleSelectPantry} pantries={pantries} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, gap: 12 },
    title: { fontSize: 20, fontWeight: 'bold' },
    filters: { gap: 12 },
    input: { borderWidth: 1, padding: 8, borderRadius: 6 },
    empty: { color: '#888', textAlign: 'center' },
    actions: { gap: 8 },
});
