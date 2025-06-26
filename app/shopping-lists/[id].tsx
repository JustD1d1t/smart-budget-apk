// app/shopping-lists/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
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
    const router = useRouter();
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'name' | 'category'>('name');
    const [groupedView, setGroupedView] = useState(false);
    const [showPantryModal, setShowPantryModal] = useState(false);
    const [pantries, setPantries] = useState<{ id: string; name: string }[]>([]);
    const [toastData, setToastData] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showMembers, setShowMembers] = useState(false);
    const [showAddProduct, setShowAddProduct] = useState(false);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToastData({ message, type });
        setTimeout(() => setToastData(null), 3000);
    };

    const {
        selectedList,
        isOwner,
        items,
        fetchListDetails,
        fetchListItems,
        members,
        fetchMembers,
        addMember,
        removeMember,
        toggleItem,
        editItem,
        deleteBoughtItems,
        fetchLists,
        moveBoughtToPantry,
        addItem,
    } = useShoppingListStore();

    useEffect(() => {
        if (!id) return;
        fetchListDetails(id).then(res => {
            if (!res.success) return router.replace('/shopping-lists');
        });
        fetchListItems(id);
        fetchMembers(id);
        fetchLists();
    }, [id, isOwner]);

    const handleSaveEdit = async () => {
        if (!editingItem) return;
        await editItem(editingItem);
        setEditingItem(null);
    };

    const handleSelectPantry = async (pantryId: string) => {
        const { success, error } = await moveBoughtToPantry(pantryId);
        if (success) showToast('Przeniesiono do spiżarni', 'success');
        else showToast(error || 'Błąd przenoszenia', 'error');
        setShowPantryModal(false);
    };

    const handleAddItem = (item: any) => {
        addItem(item);
        showToast('Dodano produkt', 'success');
        setShowAddProduct(false);
    };

    const addShoppingListMember = async (friendEmail: string) => {
        if (!id) return;
        const { success, error } = await addMember(id, friendEmail);
        success ? showToast('Dodano współtwórcę', 'success') : showToast(error!, 'error');
    };

    const removeShoppingListMember = async (friendEmail: string) => {
        if (!id) return;
        const { success, error } = await removeMember(id, friendEmail);
        success ? showToast('Usunięto współtwórcę', 'success') : showToast(error!, 'error');
    };

    const filteredItems = items
        .filter(item => filterCategory === 'all' || item.category === filterCategory)
        .sort((a, b) =>
            sortBy === 'name'
                ? a.name.localeCompare(b.name)
                : a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
        );
    const categories = Array.from(new Set(items.map(i => i.category)));

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {toastData && <Toast message={toastData.message} type={toastData.type} />}
            <View style={styles.header}>
                <Text style={styles.title}>{selectedList?.name}</Text>

                <View style={styles.headerActions}>

                    <TouchableOpacity onPress={() => setShowMembers(true)}>
                        <Text style={styles.memberIcon}>👤</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowAddProduct(true)}>
                        <Text style={styles.memberIcon}>➕</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.filters}>
                <Button onPress={() => setGroupedView(!groupedView)} variant="neutral">
                    {groupedView ? 'Lista' : 'Kategorie'}
                </Button>
                <Select
                    label="Filtruj"
                    value={filterCategory}
                    options={['all', ...categories]}
                    onChange={setFilterCategory}
                />
            </View>
            {filteredItems.length === 0 ? (
                <Text style={styles.empty}>Brak produktów</Text>
            ) : groupedView ? (
                <GroupedItemList
                    items={filteredItems}
                    onToggle={toggleItem}
                    onEdit={setEditingItem}
                />
            ) : (
                <ItemList
                    items={filteredItems}
                    onToggle={toggleItem}
                    onEdit={setEditingItem}
                />
            )}
            {filteredItems.length > 0 && (
                <View style={styles.actions}>
                    <Button onPress={deleteBoughtItems} variant="danger">
                        Usuń kupione
                    </Button>
                    {pantries.length > 0 &&
                        (<Button
                            onPress={() => setShowPantryModal(true)}
                            variant="confirm"
                        >
                            Przenieś do spiżarni
                        </Button>)
                    }
                </View>
            )}

            {editingItem && (
                <EditItemModal
                    item={editingItem}
                    onChange={setEditingItem}
                    onClose={() => setEditingItem(null)}
                    onSave={handleSaveEdit}
                />
            )}

            <PantrySelectModal
                isOpen={showPantryModal}
                onClose={() => setShowPantryModal(false)}
                onSelect={handleSelectPantry}
                pantries={pantries}
            />
            <Modal visible={showMembers} animationType="slide">
                <View style={styles.modal}>
                    <MemberList
                        isOwner={isOwner}
                        members={members}
                        onAddFriend={addShoppingListMember}
                        onRemoveFriend={removeShoppingListMember}
                    />
                    <Button onPress={() => setShowMembers(false)} variant="neutral">Zamknij</Button>
                </View>
            </Modal>
            <Modal visible={showAddProduct} animationType="slide">
                <View style={styles.modal}>
                    <AddItemForm listId={id!} onItemAdded={handleAddItem} />
                    <Button onPress={() => setShowAddProduct(false)} variant="neutral">Zamknij</Button>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, gap: 12 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: 'bold' },
    filters: { gap: 12 },
    empty: { color: '#888', textAlign: 'center' },
    actions: { gap: 8 },
    modal: { flex: 1, padding: 16, backgroundColor: '#fff' },
    memberIcon: { fontSize: 24 },
    header: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' },
    headerActions: { display: 'flex', flexDirection: 'row', gap: 8 }
});
