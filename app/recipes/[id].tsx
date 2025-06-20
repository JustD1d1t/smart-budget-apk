import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

type Ingredient = {
    name: string;
    quantity: number;
    unit: string;
};

type Recipe = {
    id: string;
    name: string;
    description?: string;
    ingredients: Ingredient[];
};

export default function RecipeDetailsPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipe = async () => {
            if (!id || typeof id !== "string") return;

            const { data, error } = await supabase
                .from("recipes")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Błąd podczas pobierania przepisu:", error.message);
                setRecipe(null);
            } else {
                setRecipe(data);
            }

            setLoading(false);
        };

        fetchRecipe();
    }, [id]);

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
                <Button title="⬅️ Wróć" onPress={() => router.back()} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{recipe.name}</Text>

            {recipe.description && (
                <Text style={styles.description}>{recipe.description}</Text>
            )}

            <Text style={styles.sectionTitle}>🧂 Składniki</Text>
            <FlatList
                data={recipe.ingredients}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                    <Text style={styles.ingredient}>
                        {item.quantity} {item.unit} – {item.name}
                    </Text>
                )}
            />

            <View style={styles.buttonWrapper}>
                <Button title="⬅️ Wróć" onPress={() => router.back()} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        maxWidth: 640,
        width: "100%",
        alignSelf: "center",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 8,
    },
    description: {
        color: "#6b7280",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    ingredient: {
        fontSize: 14,
        marginBottom: 4,
    },
    empty: {
        fontSize: 16,
        color: "#6b7280",
        marginBottom: 12,
    },
    buttonWrapper: {
        marginTop: 24,
    },
});
