// app/shopping-lists/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import { supabase } from '../../lib/supabaseClient';

export default function ShoppingListDetailsPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState<any | null>(null);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [isOwner, setIsOwner] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'name' | 'category'>('name');
    const [groupedView, setGroupedView] = useState(false);

    const [showPantryModal, setShowPantryModal] = useState(false);
    const [pantries, setPantries] = useState<any[]>([]);
    const [selectedPantryId, setSelectedPantryId] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchListDetails();
            fetchItems();
            fetchMembers();
        }
    }, [id]);

    const fetchListDetails = async () => {
        const { data } = await supabase.from('shopping_lists').select('id, name').eq('id', id).single();
        if (data) setList(data);
    };

    const fetchItems = async () => {
        setLoading(true);
        const { data } = await supabase.from('shopping_items').select('*').eq('list_id', id);
        if (data) setItems(data);
        setLoading(false);
    };

    const fetchMembers = async () => {
        const { data } = await supabase.from('shopping_list_members').select('*').eq('list_id', id);
        if (data) {
            setMembers(data);
            const user = await supabase.auth.getUser();
            setIsOwner(data.some((m) => m.user_id === user.data.user?.id && m.role === 'owner'));
        }
    };

    const fetchPantries = async () => {
        const { data } = await supabase.from('pantries').select('id, name');
        if (data) setPantries(data);
    };

    const toggleItem = async (itemId: string, current: boolean) => {
        await supabase.from('shopping_items').update({ bought: !current }).eq('id', itemId);
        setItems((prev) =>
            prev.map((item) => (item.id === itemId ? { ...item, bought: !current } : item))
        );
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;
        await supabase
            .from('shopping_items')
            .update({
                name: editingItem.name,
                quantity: editingItem.quantity,
                unit: editingItem.unit,
            })
            .eq('id', editingItem.id);
        setItems((prev) => prev.map((item) => (item.id === editingItem.id ? editingItem : item)));
        setEditingItem(null);
    };

    const handleDeleteBoughtItems = async () => {
        const boughtIds = items.filter((item) => item.bought).map((item) => item.id);
        if (boughtIds.length === 0) return;
        await supabase.from('shopping_items').delete().in('id', boughtIds);
        setItems((prev) => prev.filter((item) => !item.bought));
    };

    const handleMoveBoughtToPantry = () => {
        setShowPantryModal(true);
        fetchPantries();
    };

    const handleSelectPantry = async (pantryId: string) => {
        const boughtItems = items.filter((i) => i.bought);
        if (boughtItems.length === 0) {
            Alert.alert('Brak produktów', 'Brak kupionych produktów do przeniesienia.');
            return;
        }

        const toInsert = boughtItems.map((i) => ({
            pantry_id: pantryId,
            name: i.name,
            category: i.category,
            quantity: i.quantity,
            unit: i.unit,
        }));

        const { error: insertError } = await supabase.from('pantry_items').insert(toInsert);
        if (insertError) {
            Alert.alert('Błąd', 'Nie udało się przenieść do spiżarni');
            return;
        }

        const { error: deleteError } = await supabase
            .from('shopping_items')
            .delete()
            .in('id', boughtItems.map((i) => i.id));
        if (deleteError) {
            Alert.alert('Błąd', 'Nie udało się usunąć z listy');
            return;
        }

        setItems((prev) => prev.filter((item) => !item.bought));
        setShowPantryModal(false);
        Alert.alert('Sukces', 'Przeniesiono do spiżarni');
    };

    const handleInviteMember = async (email: string) => {
        const { data: users } = await supabase.from('users').select('id, email').eq('email', email);
        if (!users || users.length === 0) {
            Alert.alert('Błąd', 'Nie znaleziono użytkownika.');
            return;
        }

        const user = users[0];
        const { data: existing } = await supabase
            .from('shopping_list_members')
            .select('id')
            .eq('list_id', id)
            .eq('user_id', user.id);

        if (existing && existing.length > 0) {
            Alert.alert('Użytkownik już jest na liście.');
            return;
        }

        const { error } = await supabase.from('shopping_list_members').insert({
            list_id: id,
            user_id: user.id,
            email: user.email,
            role: 'member',
        });

        if (error) {
            Alert.alert('Błąd', 'Nie udało się zaprosić użytkownika.');
        } else {
            fetchMembers();
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        const { error } = await supabase.from('shopping_list_members').delete().eq('id', memberId);
        if (!error) {
            fetchMembers();
        }
    };

    const filteredItems = items
        .filter((item) => filterCategory === 'all' || item.category === filterCategory)
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
        });

    const categories = [...new Set(items.map((item) => item.category))];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Lista: {list?.name}</Text>

            <MemberList
                isOwner={isOwner}
                members={members}
                onInvite={handleInviteMember}
                onRemove={handleRemoveMember}
            />

            <AddItemForm
                listId={id as string}
                onItemAdded={(item) => setItems((prev) => [...prev, item])}
            />

            <View style={styles.filters}>
                <Button onPress={() => setGroupedView(!groupedView)} variant="neutral">
                    {groupedView ? 'Pokaż jako listę' : 'Pogrupuj po kategoriach'}
                </Button>
                <Select
                    label="Filtruj kategorię"
                    value={filterCategory}
                    options={["all", ...categories]}
                    onChange={setFilterCategory}
                />
            </View>

            {loading ? (
                <ActivityIndicator />
            ) : filteredItems.length === 0 ? (
                <Text style={styles.empty}>Brak produktów</Text>
            ) : groupedView ? (
                <GroupedItemList
                    items={filteredItems}
                    filterCategory={filterCategory}
                    onToggle={toggleItem}
                    onEdit={setEditingItem}
                />
            ) : (
                <ItemList items={filteredItems} onToggle={toggleItem} onEdit={setEditingItem} />
            )}

            {filteredItems.length ?
                <View style={styles.actions}>
                    <Button onPress={handleDeleteBoughtItems} variant="danger">
                        🗑️ Usuń kupione
                    </Button>
                    <Button onPress={handleMoveBoughtToPantry} variant="confirm">
                        📦 Przenieś kupione do spiżarni
                    </Button>
                </View>
                : ''}

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
            />
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
