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
import Toast from "../../components/ui/Toast";
import { supabase } from "../../lib/supabaseClient";

import type { Recipe } from "../../stores/recipesStore";


export default function RecipeDetailsPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            if (!id) return;
            setLoading(true);
            const { data, error } = await supabase
                .from("recipes")
                .select("*")
                .eq("id", id)
                .single();
            if (error) {
                setToast({ message: "Nie udało się pobrać przepisu.", type: 'error' });
                setRecipe(null);
            } else {
                setRecipe(data);
            }
            setLoading(false);
        };
        fetchRecipe();
    }, [id]);

    const handleDelete = async () => {
        if (!id) return;
        const { error } = await supabase.from('recipes').delete().eq('id', id);
        if (error) {
            setToast({ message: 'Błąd usuwania przepisu', type: 'error' });
        } else {
            setToast({ message: 'Przepis usunięty', type: 'success' });
            router.replace('..');
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
        <View style={styles.container}>
            {toast && <Toast message={toast.message} type={toast.type} />}
            <View style={styles.header}>
                <Text style={styles.title}>{recipe.name}</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => setEditOpen(true)}>
                        <Text style={styles.icon}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                        <Text style={styles.icon}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {recipe.description && <Text style={styles.description}>{recipe.description}</Text>}

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

            <Modal visible={editOpen} animationType="slide" onRequestClose={() => setEditOpen(false)}>
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
        width: '100%',
        alignSelf: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    description: {
        color: '#6b7280',
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    ingredient: {
        fontSize: 14,
        marginBottom: 4,
    },
    empty: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    icon: {
        fontSize: 24,
        marginHorizontal: 8,
    },
    deleteBtn: {
        marginLeft: 8,
    },
});
