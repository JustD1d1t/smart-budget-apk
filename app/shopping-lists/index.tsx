// app/shopping-lists/index.tsx
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { supabase } from '../../lib/supabaseClient';

type ShoppingList = {
  id: string;
  name: string;
  isOwner: boolean;
};

export default function ShoppingListsPage() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const router = useRouter();

  const fetchLists = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const { data: listData, error } = await supabase
      .from('shopping_lists')
      .select('id, name, owner_id');

    if (error) {
      Alert.alert('Błąd', 'Nie udało się pobrać list');
    } else {
      const withOwnership = listData.map((list) => ({
        id: list.id,
        name: list.name,
        isOwner: list.owner_id === userId,
      }));
      setLists(withOwnership);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleAddList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Błąd', 'Nazwa nie może być pusta.');
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId || userError) {
      Alert.alert('Błąd', 'Nie udało się pobrać użytkownika.');
      return;
    }

    const { data: listData, error: listError } = await supabase
      .from('shopping_lists')
      .insert({ name: newListName, owner_id: userId })
      .select()
      .single();

    if (listError || !listData) {
      Alert.alert('Błąd', 'Nie udało się dodać listy.');
      return;
    }

    await supabase
      .from('shopping_list_members')
      .insert({ list_id: listData.id, user_id: userId, role: 'owner' });

    setNewListName('');
    await fetchLists();
    Alert.alert('Sukces', 'Lista dodana.');
  };

  const handleRemoveList = async (id: string) => {
    const { error } = await supabase.from('shopping_lists').delete().eq('id', id);
    if (!error) {
      setLists((prev) => prev.filter((list) => list.id !== id));
      Alert.alert('Usunięto', 'Lista została usunięta.');
    } else {
      Alert.alert('Błąd', 'Nie udało się usunąć listy.');
    }
  };

  const handleEditClick = (list: ShoppingList) => {
    setEditingId(list.id);
    setEditingName(list.name);
  };

  const handleRenameList = async (id: string) => {
    if (!editingName.trim()) return;
    const { error } = await supabase
      .from('shopping_lists')
      .update({ name: editingName })
      .eq('id', id);

    if (!error) {
      Alert.alert('Sukces', 'Zmieniono nazwę listy.');
      setEditingId(null);
      setEditingName('');
      fetchLists();
    } else {
      Alert.alert('Błąd', 'Nie udało się zmienić nazwy.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Twoje listy zakupowe</Text>

      <View style={styles.form}>
        <Input
          placeholder="Nazwa listy"
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
                  <Input value={editingName} onChangeText={setEditingName} />
                  <View style={styles.row}>
                    <Button onPress={() => handleRenameList(item.id)} variant="confirm">
                      Zapisz
                    </Button>
                    <Button onPress={() => setEditingId(null)} variant="neutral">
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
                      onPress={() => router.push(`/shopping-lists/${item.id}`)}
                    >
                      Otwórz
                    </Button>
                    {item.isOwner && (
                      <>
                        <Button onPress={() => handleEditClick(item)} variant="confirm">
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
