// app/recipes/index.tsx
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import Button from "../../components/ui/Button";
import ShoppingListSelectModal from "../../components/ui/ShoppingListSelectModal";
import { supabase } from "../../lib/supabaseClient";
import { useUserStore } from "../../stores/userStore";

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: Ingredient[];
}

export default function RecipesListPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const { user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) {
        console.error("Błąd podczas pobierania przepisów:", error.message);
        Alert.alert("Błąd", "Nie udało się pobrać przepisów");
        return;
      }

      setRecipes(data || []);
    };

    fetchRecipes();
  }, [user?.id]);

  const handleAddToShoppingList = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setModalOpen(true);
  };

  const handleListSelected = async (listId: string) => {
    if (!selectedRecipe) return;

    const itemsToInsert = selectedRecipe.ingredients.map((ing) => ({
      list_id: listId,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      bought: false,
      category: "żywność",
      recipe: selectedRecipe.name,
    }));

    const { error } = await supabase.from("shopping_items").insert(itemsToInsert);

    if (error) {
      Alert.alert("Błąd", "Nie udało się dodać składników do listy.");
    } else {
      Alert.alert("Sukces", `Dodano składniki przepisu "${selectedRecipe.name}"`);
    }

    setModalOpen(false);
    setSelectedRecipe(null);
  };

  const deleteRecipe = async (id: string) => {
    const { error } = await supabase.from("recipes").delete().eq("id", id);

    if (error) {
      console.error("Błąd podczas usuwania przepisu:", error.message);
      Alert.alert("Błąd", "Nie udało się usunąć przepisu");
      return;
    }

    setRecipes((prev) => prev.filter((r) => r.id !== id));
    Alert.alert("Usunięto", "Przepis został usunięty");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📖 Przepisy</Text>
        <Button onPress={() => router.push("/recipes/new")}>
          ➕ Dodaj przepis
        </Button>
      </View>

      {recipes.length === 0 ? (
        <Text style={styles.emptyText}>Brak przepisów. Dodaj swój pierwszy przepis!</Text>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: recipe }) => (
            <View style={styles.card}>
              <Text style={styles.recipeName}>{recipe.name}</Text>
              {recipe.description ? (
                <Text style={styles.description}>{recipe.description}</Text>
              ) : null}

              <View style={styles.actions}>
                <Button onPress={() => handleAddToShoppingList(recipe)}>
                  ➕ Dodaj do listy
                </Button>
                <Button onPress={() => deleteRecipe(recipe.id)}>
                  🗑️ Usuń
                </Button>
                <Button onPress={() => router.push(`/recipes/${recipe.id}`)}>
                  📖 Otwórz przepis
                </Button>
              </View>
            </View>
          )}
        />
      )}

      {modalOpen && selectedRecipe && (
        <ShoppingListSelectModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSelect={handleListSelected}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 24,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 12,
  },
  actions: {
    gap: 8,
    marginTop: 8,
  },
});
