// app/recipes/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import EditRecipeModal from "../../components/recipes/EditRecipeModal";
import Button from "../../components/ui/Button";
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

export default function RecipeDetailsPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);

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
                <Button onPress={() => router.back()}>⬅️ Wróć</Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.title}>{recipe.name}</Text>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={() => setEditOpen(true)}
                    >
                        <Text style={styles.filterIcon}>✏️</Text>
                    </TouchableOpacity>
                </View>
            </View>

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
            <Modal
                visible={editOpen}
                animationType="slide"
                onRequestClose={() => setEditOpen(false)}
            >

                <EditRecipeModal />
                <Button onPress={() => setEditOpen(false)} variant="neutral">Zamknij</Button>
            </Modal>
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
    memberIcon: { fontSize: 24 },
    header: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' },
    headerActions: { display: 'flex', flexDirection: 'row', gap: 8 },
    filterIcon: {
        fontSize: 24,
    },
});
