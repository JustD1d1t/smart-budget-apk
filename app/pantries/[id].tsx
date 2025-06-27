import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import AddPantryItemForm from "../../components/pantries/AddPantryItemForm";
import EditPantryItemModal from "../../components/pantries/EditPantryItemModal";
import GroupedItemList from "../../components/pantries/GroupedItemList";
import ItemList from "../../components/pantries/ItemList";
import Button from '../../components/ui/Button';
import MemberList from '../../components/ui/MemberList';
import Select from "../../components/ui/Select";
import Toast from "../../components/ui/Toast";
import { usePantriesStore } from "../../stores/pantriesStore";

const sortOptions = [
  { label: 'nazwa', value: 'name' },
  { label: 'kategoria', value: 'category' },
  { label: 'data przydatności', value: 'expiry_date' },
];

export default function PantryDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'expiry_date'>('name');
  const [groupedView, setGroupedView] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);


  const {
    selectedPantry,
    pantryItems,
    loading,
    isOwner,
    members,
    fetchPantryDetails,
    fetchPantryItems,
    updatePantryItem,
    deletePantryItem,
    updateItemQuantity,
    fetchPantries,
    addMember,
    removeMember,
    removePantry,
    fetchMembers,
  } = usePantriesStore();

  useEffect(() => {
    if (id) {
      fetchPantryDetails(id);
      fetchPantryItems(id);
      fetchMembers(id);
    }
  }, [id]);

  // Delete pantry
  const handleDeletePantry = async () => {
    if (!id) return;
    const { success, error } = await removePantry(id);
    if (error) {
      setToast({ message: 'Błąd usuwania spiżarni', type: 'error' });
    } else {
      setToast({ message: 'Spiżarnia usunięta', type: 'success' });
      await fetchPantries();
      router.replace('..');
    }
  };

  const handleAddItem = async () => {
    await fetchPantryItems(id);
    setShowAddProduct(false);
  };

  const handleAddMember = async (email: string) => {
    if (!id) return;
    const { success, error } = await addMember(id, email);
    setToast({ message: success ? 'Dodano współtwórcę' : error!, type: success ? 'success' : 'error' });
    if (success) fetchMembers(id);
  };

  const handleRemoveMember = async (email: string) => {
    if (!id) return;
    const { success, error } = await removeMember(id, email);
    setToast({ message: success ? 'Usunięto współtwórcę' : error!, type: success ? 'success' : 'error' });
    if (success) fetchMembers(id);
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
    .filter((item) => filterCategory === 'all' || item.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'category') return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      if (sortBy === 'expiry_date') {
        const dateA = a.expiry_date ? new Date(a.expiry_date).getTime() : Infinity;
        const dateB = b.expiry_date ? new Date(b.expiry_date).getTime() : Infinity;
        return dateA - dateB;
      }
      return 0;
    });

  const categories = ['all', ...new Set(pantryItems.map((item) => item.category))];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📦 {selectedPantry?.name || ''}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleDeletePantry}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFiltersOpen(true)}>
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowMembers(true)}>
            <Text style={styles.memberIcon}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddProduct(true)}>
            <Text style={styles.memberIcon}>➕</Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : filteredItems.length === 0 ? (
        <Text style={styles.empty}>Brak produktów</Text>
      ) : groupedView ? (
        <GroupedItemList items={filteredItems} onEdit={setEditingItem} onDelete={handleDeleteItem} />
      ) : (
        <ItemList items={filteredItems} onEdit={setEditingItem} onDelete={handleDeleteItem} onQuantityChange={handleQuantityChange} />
      )}
      {editingItem && (
        <EditPantryItemModal item={editingItem} onChange={setEditingItem} onClose={() => setEditingItem(null)} onSave={handleSaveEdit} />
      )}
      <Modal visible={showMembers} animationType='slide'>
        <View style={styles.modal}>
          <MemberList isOwner={isOwner} members={members} onAddFriend={handleAddMember} onRemoveFriend={handleRemoveMember} />
          <Button onPress={() => setShowMembers(false)} variant='neutral'>Zamknij</Button>
        </View>
      </Modal>
      <Modal visible={showAddProduct} animationType='slide'>
        <View style={styles.modal}>
          <AddPantryItemForm pantryId={id as string} onItemAdded={handleAddItem} />
          <Button onPress={() => setShowAddProduct(false)} variant='neutral'>Zamknij</Button>
        </View>
      </Modal>
      <Modal visible={filtersOpen} animationType='slide' onRequestClose={() => setFiltersOpen(false)}>
        <View style={[styles.modal, styles.gap]}>
          <Select label='Kategoria' value={filterCategory} options={categories.map((c) => ({ value: c, label: c }))} onChange={setFilterCategory} />
          {!groupedView && <Select label='Sortuj po' value={sortBy} options={sortOptions} onChange={setSortBy} />}
          <Button onPress={() => setGroupedView(!groupedView)} variant='neutral'>
            {groupedView ? 'Pokaż jako listę' : 'Pogrupuj po kategoriach'}
          </Button>
          <Button onPress={() => setFiltersOpen(false)} variant='neutral'>Zamknij</Button>
        </View>
      </Modal>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  loader: { marginVertical: 20 },
  empty: { textAlign: 'center', color: '#888', marginVertical: 20 },
  modal: { flex: 1, padding: 16, backgroundColor: '#fff' },
  memberIcon: { fontSize: 24 },
  filterIcon: { fontSize: 24 },
  deleteIcon: { fontSize: 24, color: '#dc2626' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: { flexDirection: 'row', gap: 8 },
  gap: { gap: 12 },
});
