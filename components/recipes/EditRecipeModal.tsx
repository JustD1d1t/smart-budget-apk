// app/recipes/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import IngredientListEditor from "../../components/recipes/IngredientListEditor";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Toast from "../../components/ui/Toast";
import { supabase } from "../../lib/supabaseClient";

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

type IngredientError = {
  name?: string;
  quantity?: string;
  unit?: string;
};

export default function EditRecipePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingredientErrors, setIngredientErrors] = useState<IngredientError[]>([]);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Helper to show and auto-dismiss toast
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch recipe once
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single<Recipe>();

      if (error || !data) {
        showToast("Nie udało się wczytać przepisu.", "error");
        setRecipe(null);
      } else {
        setRecipe(data);
        setName(data.name);
        setDescription(data.description || "");
        setIngredients(data.ingredients || []);
        setIngredientErrors(data.ingredients.map(() => ({})));
      }
      setLoading(false);
    })();
  }, [id]);

  // Validate before submit
  const validate = () => {
    let ok = true;
    const errs: IngredientError[] = ingredients.map(() => ({}));

    if (!name.trim()) {
      ok = false;
      showToast("Nazwa przepisu jest wymagana.", "error");
    }
    if (description.trim().length < 50) {
      ok = false;
      showToast("Opis musi mieć przynajmniej 50 znaków.", "error");
    }
    ingredients.forEach((ing, i) => {
      if (!ing.name.trim()) {
        errs[i].name = "Brak nazwy";
        ok = false;
      }
      if (!(ing.quantity > 0)) {
        errs[i].quantity = "Ilość > 0";
        ok = false;
      }
      if (!ing.unit.trim()) {
        errs[i].unit = "Wybierz jednostkę";
        ok = false;
      }
    });
    setIngredientErrors(errs);
    return ok;
  };

  // Submit updates recipe
  const handleSubmit = async () => {
    if (!validate() || !id) return;
    const payload = { name: name.trim(), description: description.trim(), ingredients };
    const { error } = await supabase.from("recipes").update(payload).eq("id", id);
    if (error) {
      showToast("Błąd zapisu zmian.", "error");
    } else {
      showToast("Przepis zaktualizowany!", "success");
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Nie znaleziono przepisu.</Text>
        <Button onPress={() => router.back()}>⬅️ Wróć</Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <Input
        label="Nazwa przepisu"
        value={name}
        onChangeText={setName}
        error={!name.trim() ? "Wymagana" : undefined}
      />

      <Textarea
        label="Opis"
        placeholder="Opis (min. 50 znaków)"
        value={description}
        onChangeText={setDescription}
        error={description.trim().length < 50 ? "Za krótki opis" : undefined}
        numberOfLines={4}
      />

      <Text style={styles.sectionTitle}>🧂 Składniki</Text>
      <IngredientListEditor
        ingredients={ingredients}
        errors={ingredientErrors}
        onChange={(idx, updated) => {
          const next = [...ingredients];
          next[idx] = updated;
          setIngredients(next);
        }}
        onRemove={(idx) => {
          setIngredients(ingredients.filter((_, i) => i !== idx));
          setIngredientErrors(ingredientErrors.filter((_, i) => i !== idx));
        }}
      />
      <Button onPress={() => {
        setIngredients([...ingredients, { name: "", quantity: 1, unit: "" }]);
        setIngredientErrors([...ingredientErrors, {}]);
      }}>
        ➕ Dodaj składnik
      </Button>

      <View>
        <Button onPress={handleSubmit} variant="confirm">
          ✅ Zapisz przepis
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  empty: {
    fontSize: 16,
    color: "#6b7280",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
});
