// app/shopping-lists/index.tsx
import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ListItem from '../../components/shopping-list/ListItem'; // <<–– importujemy tu
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Toast from '../../components/ui/Toast';
import { useShoppingListStore } from '../../stores/shoppingListStore';

export default function ShoppingListsPage() {
  const { lists, fetchLists, addList, removeList, renameList } =
    useShoppingListStore();

  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [toastData, setToastData] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastData({ message, type });
    setTimeout(() => setToastData(null), 3000);
  };

  const reload = async () => {
    setLoading(true);
    const { success, error } = await fetchLists();
    setLoading(false);
    if (!success) showToast(error || 'Nie udało się pobrać list', 'error');
  };

  useEffect(() => {
    reload();
  }, []);

  const handleAddList = async () => {
    if (!newListName.trim()) {
      showToast('Nazwa nie może być pusta.', 'error');
      return;
    }
    const { success, error } = await addList(newListName.trim());
    if (success) {
      showToast('Lista dodana.', 'success');
      setNewListName('');
      reload();
    } else {
      showToast(error || 'Nie udało się dodać listy.', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Twoje listy zakupowe</Text>

      <View style={styles.form}>
        <Input
          placeholder="Nazwa nowej listy"
          value={newListName}
          onChangeText={setNewListName}
        />
        <Button onPress={handleAddList} variant="confirm">
          Dodaj listę
        </Button>
      </View>

      {loading ? (
        <Text>Ładowanie...</Text>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <ListItem
              list={item}
            />
          )}
        />
      )}

      {toastData && (
        <Toast message={toastData.message} type={toastData.type} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    gap: 8,
  },
  inlineEdit: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
