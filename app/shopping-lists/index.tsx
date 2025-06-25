// app/shopping-lists/index.tsx
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Toast from '../../components/ui/Toast';
import { useShoppingListStore } from '../../stores/shoppingListStore';

export default function ShoppingListsPage() {
  const router = useRouter();
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

    if (!success) {
      showToast(`Błąd, ${error}` || 'Nie udało się pobrać list', 'error');
    }
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
      await fetchLists();
    } else {
      showToast(error || 'Nie udało się dodać listy.', 'error');
    }
  };

  const handleRemoveList = async (id: string) => {
    const { success, error } = await removeList(id);
    if (success) {
      showToast('Lista usunięta.', 'success');
    } else {
      showToast(error || 'Nie udało się usunąć listy.', 'error');
    }
  };

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleRename = async (id: string) => {
    if (!editingName.trim()) {
      showToast('Nazwa nie może być pusta.', 'error');
      return;
    }
    const { success, error } = await renameList(id, editingName.trim());
    if (success) {
      showToast('Zmieniono nazwę listy.', 'success');
      setEditingId(null);
      setEditingName('');
      await fetchLists();
    } else {
      showToast(error || 'Nie udało się zmienić nazwy.', 'error');
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
            <Card>
              {editingId === item.id ? (
                <>
                  <Input
                    value={editingName}
                    onChangeText={setEditingName}
                  />
                  <View style={styles.row}>
                    <Button
                      onPress={() => handleRename(item.id)}
                      variant="confirm"
                    >
                      Zapisz
                    </Button>
                    <Button
                      onPress={() => setEditingId(null)}
                      variant="neutral"
                    >
                      Anuluj
                    </Button>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.listName}>{item.name}</Text>
                  <View style={styles.row}>
                    <Button
                      variant="neutral"
                      onPress={() =>
                        router.push(`/shopping-lists/${item.id}`)
                      }
                    >
                      Otwórz
                    </Button>
                    {item.isOwner && (
                      <>
                        <Button
                          onPress={() =>
                            startEditing(item.id, item.name)
                          }
                          variant="confirm"
                        >
                          Edytuj
                        </Button>
                        <Button
                          onPress={() => handleRemoveList(item.id)}
                          variant="danger"
                        >
                          Usuń
                        </Button>
                      </>
                    )}
                  </View>
                </>
              )}
            </Card>
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
  listName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
