import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import IngredientListEditor from "../../components/recipes/IngredientListEditor";
import { supabase } from "../../lib/supabaseClient";
import { useUserStore } from "../../stores/userStore";

type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
};

type IngredientError = {
  name?: string;
  quantity?: string;
  unit?: string;
};

export default function NewRecipePage() {
  const { user } = useUserStore();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: 1, unit: "" },
  ]);

  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    ingredients?: string;
    ingredientFields: IngredientError[];
  }>({
    ingredientFields: [],
  });

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: 1, unit: "" }]);
    setErrors((prev) => ({
      ...prev,
      ingredientFields: [...prev.ingredientFields, {}],
    }));
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const ingredientErrors: IngredientError[] = [];

    const validIngredients = ingredients.filter((i) => i.name.trim() !== "");

    const newErrors = {
      name: undefined,
      description: undefined,
      ingredients: undefined,
      ingredientFields: [] as IngredientError[],
    };

    if (!trimmedName) {
      newErrors.name = "Nazwa przepisu jest wymagana.";
    }

    if (trimmedDescription.length < 50) {
      newErrors.description = "Opis musi zawierać co najmniej 50 znaków.";
    }

    if (validIngredients.length < 2) {
      newErrors.ingredients = "Podaj co najmniej 2 składniki z nazwą.";
    }

    ingredients.forEach((i, index) => {
      const err: IngredientError = {};
      if (i.name.trim() !== "") {
        if (isNaN(i.quantity) || i.quantity <= 0) {
          err.quantity = "Podaj poprawną ilość (> 0)";
        }
        if (!i.unit.trim()) {
          err.unit = "Wybierz jednostkę";
        }
      }
      ingredientErrors[index] = err;
    });

    newErrors.ingredientFields = ingredientErrors;

    const hasErrors =
      !!newErrors.name ||
      !!newErrors.description ||
      !!newErrors.ingredients ||
      ingredientErrors.some((e) => Object.keys(e).length > 0);

    setErrors(newErrors);
    if (hasErrors) return;

    if (!user?.id) {
      Alert.alert("Błąd", "Musisz być zalogowany, aby zapisać przepis.");
      return;
    }

    const { error } = await supabase.from("recipes").insert({
      id: crypto.randomUUID(),
      name: trimmedName,
      description: trimmedDescription,
      ingredients: validIngredients,
      user_id: user.id,
    });

    if (error) {
      console.error("Błąd zapisu przepisu:", error.message);
      Alert.alert("Błąd", "Wystąpił błąd podczas zapisu przepisu.");
      return;
    }

    router.push("/recipes");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>➕ Nowy przepis</Text>

      <TextInput
        placeholder="Nazwa przepisu"
        value={name}
        onChangeText={setName}
        style={[styles.input, errors.name && styles.errorInput]}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <TextInput
        placeholder="Opis (min. 50 znaków)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={[styles.textarea, errors.description && styles.errorInput]}
      />
      {errors.description && (
        <Text style={styles.errorText}>{errors.description}</Text>
      )}

      <Text style={styles.sectionTitle}>Składniki</Text>

      <IngredientListEditor
        ingredients={ingredients}
        setIngredients={setIngredients}
        errors={errors.ingredientFields}
      />

      {errors.ingredients && (
        <Text style={styles.errorText}>{errors.ingredients}</Text>
      )}

      <View style={styles.buttonWrapper}>
        <Button title="➕ Dodaj składnik" onPress={handleAddIngredient} />
      </View>

      <View style={styles.buttonWrapper}>
        <Button title="✅ Zapisz przepis" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },
  errorInput: {
    borderColor: "#dc2626",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginBottom: 4,
  },
  buttonWrapper: {
    marginTop: 16,
  },
});
